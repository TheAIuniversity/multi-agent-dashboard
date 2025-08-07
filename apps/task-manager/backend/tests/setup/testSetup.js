const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/task_management_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_PRIVATE_KEY = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBdGVzdA=='; // Test key
process.env.JWT_PUBLIC_KEY = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUE='; // Test key

// Global test utilities
global.testUtils = {
  // Database utilities
  prisma: new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  }),
  
  // Redis utilities
  redis: new Redis(process.env.REDIS_URL),
  
  // Test data generation
  generateTestUser: () => ({
    id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Date.now()}@example.com`,
    name: 'Test User',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYLXXzQgJbAMJn.', // "password"
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  generateTestProject: (userId) => ({
    id: `test-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Project',
    description: 'Test project description',
    organizationId: `test-org-${Date.now()}`,
    createdBy: userId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  generateTestTask: (projectId, userId) => ({
    id: `test-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 'medium',
    projectId,
    createdBy: userId,
    assigneeId: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  generateJWT: (payload) => {
    const jwt = require('jsonwebtoken');
    const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString();
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'task-management-app',
      audience: 'task-management-users'
    });
  }
};

// Database cleanup utilities
global.cleanupDatabase = async () => {
  const { prisma } = global.testUtils;
  
  // Delete in reverse order of dependencies
  await prisma.taskComment.deleteMany({});
  await prisma.taskAttachment.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
};

// Redis cleanup utilities
global.cleanupRedis = async () => {
  const { redis } = global.testUtils;
  await redis.flushdb();
};

// Setup before each test
beforeEach(async () => {
  // Clean database
  await global.cleanupDatabase();
  
  // Clean Redis
  await global.cleanupRedis();
  
  // Reset all mocks
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  await global.cleanupDatabase();
  await global.cleanupRedis();
  await global.testUtils.prisma.$disconnect();
  await global.testUtils.redis.disconnect();
});

// Custom matchers
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidISO8601(received) {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    const pass = iso8601Regex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO8601 date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO8601 date`,
        pass: false,
      };
    }
  },
  
  toHaveValidTaskStructure(received) {
    const requiredFields = ['id', 'title', 'status', 'priority', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length === 0) {
      return {
        message: () => `expected task not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected task to have valid structure, missing fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Suppress console output during tests unless explicitly enabled
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}