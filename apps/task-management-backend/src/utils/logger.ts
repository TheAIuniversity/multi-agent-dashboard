import winston from 'winston';
import path from 'path';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let log = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'task-management-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    
    // Write security events to security.log
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Security logger for audit events
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-management-security',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Performance logger for monitoring
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-management-performance',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Database logger for query monitoring
export const dbLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-management-database',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'database.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Request logger middleware
export const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-management-requests',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Utility functions for structured logging
export const LogContext = {
  request: (req: any) => ({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.userId,
  }),
  
  user: (userId: string, email?: string) => ({
    userId,
    email,
  }),
  
  task: (taskId: string, projectId?: string) => ({
    taskId,
    projectId,
  }),
  
  project: (projectId: string, organizationId?: string) => ({
    projectId,
    organizationId,
  }),
  
  security: (event: string, userId?: string, ip?: string) => ({
    securityEvent: event,
    userId,
    ip,
    timestamp: new Date().toISOString(),
  }),
  
  performance: (operation: string, duration: number, details?: any) => ({
    operation,
    duration,
    ...details,
  }),
  
  error: (error: Error, context?: any) => ({
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    ...context,
  }),
};

// Security event logging helper
export const logSecurityEvent = (
  event: string,
  userId: string | null,
  ip: string,
  userAgent: string,
  details?: any
) => {
  securityLogger.info('Security Event', {
    event,
    userId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  startTime: number,
  details?: any
) => {
  const duration = Date.now() - startTime;
  performanceLogger.info('Performance Metric', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Database query logging helper
export const logDatabaseQuery = (
  query: string,
  params?: any,
  duration?: number,
  error?: Error
) => {
  if (error) {
    dbLogger.error('Database Query Error', {
      query,
      params,
      duration,
      error: LogContext.error(error),
    });
  } else {
    dbLogger.debug('Database Query', {
      query,
      params,
      duration,
    });
  }
};

// Request logging helper
export const logRequest = (
  req: any,
  res: any,
  duration: number,
  error?: Error
) => {
  const logData = {
    ...LogContext.request(req),
    statusCode: res.statusCode,
    duration,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    requestLogger.error('Request Error', {
      ...logData,
      error: LogContext.error(error),
    });
  } else {
    requestLogger.info('Request Completed', logData);
  }
};

export { logger };
export default logger;