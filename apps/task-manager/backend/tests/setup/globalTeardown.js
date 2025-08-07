const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Clean up database
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // Clean all test data
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
    
    await prisma.$disconnect();
    console.log('✅ Database cleanup completed');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  }
  
  try {
    // Clean up Redis
    const redis = new Redis(process.env.REDIS_URL);
    await redis.flushdb();
    await redis.disconnect();
    console.log('✅ Redis cleanup completed');
    
  } catch (error) {
    console.error('❌ Redis cleanup failed:', error.message);
  }
  
  console.log('✅ Test environment cleanup completed');
};