const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

module.exports = async () => {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Check if PostgreSQL is running
    console.log('📊 Checking PostgreSQL connection...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // Try to connect to database
    await prisma.$connect();
    console.log('✅ PostgreSQL connection established');
    
    // Run database migrations
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    console.log('✅ Database migrations completed');
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'pipe' });
    console.log('✅ Prisma client generated');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ PostgreSQL setup failed:', error.message);
    throw new Error('Database setup failed');
  }
  
  try {
    // Check if Redis is running
    console.log('📊 Checking Redis connection...');
    const redis = new Redis(process.env.REDIS_URL);
    
    await redis.ping();
    console.log('✅ Redis connection established');
    
    // Clear test Redis database
    await redis.flushdb();
    console.log('✅ Redis test database cleared');
    
    await redis.disconnect();
    
  } catch (error) {
    console.error('❌ Redis setup failed:', error.message);
    throw new Error('Redis setup failed');
  }
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.JWT_ACCESS_TOKEN_EXPIRY = '1h';
  process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';
  process.env.RATE_LIMIT_WINDOW_MS = '900000'; // 15 minutes
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000'; // Higher for tests
  
  console.log('✅ Test environment setup completed');
};