import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Singleton pattern for Prisma client
class DatabaseConnection {
  private static instance: PrismaClient;
  private static isConnected = false;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'colored',
      });

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        DatabaseConnection.instance.$on('query', (e) => {
          logger.debug('Database Query', {
            query: e.query,
            params: e.params,
            duration: e.duration,
          });
        });
      }

      // Log database errors
      DatabaseConnection.instance.$on('error', (e) => {
        logger.error('Database Error', {
          message: e.message,
          target: e.target,
        });
      });

      // Log database info
      DatabaseConnection.instance.$on('info', (e) => {
        logger.info('Database Info', {
          message: e.message,
          target: e.target,
        });
      });

      // Log database warnings
      DatabaseConnection.instance.$on('warn', (e) => {
        logger.warn('Database Warning', {
          message: e.message,
          target: e.target,
        });
      });
    }

    return DatabaseConnection.instance;
  }

  public static async connect(): Promise<void> {
    try {
      if (!DatabaseConnection.isConnected) {
        const prisma = DatabaseConnection.getInstance();
        await prisma.$connect();
        DatabaseConnection.isConnected = true;
        logger.info('Database connected successfully');

        // Test the connection
        await prisma.$queryRaw`SELECT 1`;
        logger.info('Database connection test passed');
      }
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      if (DatabaseConnection.instance && DatabaseConnection.isConnected) {
        await DatabaseConnection.instance.$disconnect();
        DatabaseConnection.isConnected = false;
        logger.info('Database disconnected successfully');
      }
    } catch (error) {
      logger.error('Failed to disconnect from database', error);
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }
}

// Export the database instance
export const db = DatabaseConnection.getInstance();

// Export connection management functions
export const connectDatabase = DatabaseConnection.connect;
export const disconnectDatabase = DatabaseConnection.disconnect;
export const databaseHealthCheck = DatabaseConnection.healthCheck;

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

// Database configuration
export const databaseConfig = {
  connectionTimeout: 60000, // 60 seconds
  poolTimeout: 60000,       // 60 seconds
  maxConnections: 20,       // Maximum number of connections in the pool
  minConnections: 5,        // Minimum number of connections in the pool
  idleTimeout: 30000,       // 30 seconds
  acquireTimeout: 60000,    // 60 seconds
  retryAttempts: 3,
  retryDelay: 1000,         // 1 second
};