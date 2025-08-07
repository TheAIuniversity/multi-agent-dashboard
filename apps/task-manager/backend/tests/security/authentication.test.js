const request = require('supertest');
const app = require('../../src/app');
const { FactoryManager } = require('../factories');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Authentication Security Tests', () => {
  let factory;

  beforeEach(() => {
    factory = new FactoryManager(global.testUtils.prisma);
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create test user with known password
      testUser = await factory.user.create({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User'
      });
    });

    it('should authenticate valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.data).toBeUndefined();
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should be case-insensitive for email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'SecurePassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject SQL injection attempts in email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin@example.com'; DROP TABLE users; --",
          password: 'password'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject XSS attempts in input fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          password: 'password'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce rate limiting for login attempts', async () => {
      const promises = [];
      
      // Make multiple concurrent requests to trigger rate limit
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should not leak user existence through timing attacks', async () => {
      const startTime1 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      const time1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      const time2 = Date.now() - startTime2;

      // Response times should be similar (within 100ms)
      const timeDifference = Math.abs(time1 - time2);
      expect(timeDifference).toBeLessThan(100);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        email: userData.email.toLowerCase(),
        name: userData.name
      });
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'weak', // Too short
        'password', // No uppercase, numbers, special chars
        'Password', // No numbers, special chars
        'Password123', // No special chars
        '12345678', // No letters
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            name: 'Test User',
            password
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.message).toContain('password');
      }
    });

    it('should reject duplicate email addresses', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'User One',
        password: 'SecurePassword123!'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          name: 'User Two'
        })
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should sanitize and validate input fields', async () => {
      const maliciousData = {
        email: 'test@example.com',
        name: '<script>alert("xss")</script>',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should hash passwords securely', async () => {
      const userData = {
        email: 'security@example.com',
        name: 'Security User',
        password: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify password is hashed in database
      const user = await global.testUtils.prisma.user.findUnique({
        where: { email: userData.email.toLowerCase() }
      });

      expect(user.passwordHash).not.toBe(userData.password);
      expect(user.passwordHash).toMatch(/^\$2b\$12\$/); // bcrypt hash format
      
      // Verify password can be verified
      const isValidPassword = await bcrypt.compare(userData.password, user.passwordHash);
      expect(isValidPassword).toBe(true);
    });
  });

  describe('JWT Token Security', () => {
    let testUser, validToken;

    beforeEach(async () => {
      const { user, token } = await factory.user.createWithToken();
      testUser = user;
      validToken = token;
    });

    it('should accept valid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject expired JWT tokens', async () => {
      // Create expired token
      const expiredPayload = {
        userId: testUser.id,
        email: testUser.email,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };

      const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString();
      const expiredToken = jwt.sign(expiredPayload, privateKey, { algorithm: 'RS256' });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject tampered JWT tokens', async () => {
      // Tamper with token by changing last character
      const tamperedToken = validToken.slice(0, -1) + 'X';

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject tokens with invalid signatures', async () => {
      // Create token with wrong key
      const wrongPayload = {
        userId: testUser.id,
        email: testUser.email
      };

      const wrongToken = jwt.sign(wrongPayload, 'wrong-secret-key', { algorithm: 'HS256' });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${wrongToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject tokens without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', validToken)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Session Security', () => {
    it('should invalidate refresh tokens on logout', async () => {
      const { user, refreshToken } = await factory.user.createWithRefreshToken();
      const { token } = await factory.user.createWithToken({ id: user.id });

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify refresh token is invalidated
      const tokenInDb = await global.testUtils.prisma.refreshToken.findUnique({
        where: { id: refreshToken.id }
      });

      expect(tokenInDb).toBeNull();
    });

    it('should rotate refresh tokens on use', async () => {
      const { user, refreshToken } = await factory.user.createWithRefreshToken();

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken.tokenHash
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshToken).not.toBe(refreshToken.tokenHash);

      // Old refresh token should be invalidated
      const oldToken = await global.testUtils.prisma.refreshToken.findUnique({
        where: { id: refreshToken.id }
      });
      expect(oldToken).toBeNull();
    });
  });
});