import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ErrorCode } from '@/types/api.types';

/**
 * Custom application errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, ErrorCode.CONFLICT, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, code: string = ErrorCode.FILE_TOO_LARGE) {
    const statusCode = code === ErrorCode.FILE_TOO_LARGE ? 413 : 400;
    super(message, statusCode, code);
  }
}

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2000':
      return new ValidationError('The provided value is too long for the field');
    
    case 'P2001':
      return new NotFoundError('Record', 'specified in the where condition');
    
    case 'P2002':
      const field = error.meta?.target?.[0] || 'field';
      return new ConflictError(`A record with this ${field} already exists`);
    
    case 'P2003':
      return new ValidationError('Foreign key constraint failed');
    
    case 'P2004':
      return new ValidationError('A constraint failed on the database');
    
    case 'P2005':
      return new ValidationError('The value stored in the database is invalid for the field\'s type');
    
    case 'P2006':
      return new ValidationError('The provided value is not valid for the field');
    
    case 'P2007':
      return new ValidationError('Data validation error');
    
    case 'P2008':
      return new AppError('Failed to parse the query', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2009':
      return new ValidationError('Failed to validate the query');
    
    case 'P2010':
      return new AppError('Raw query failed', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2011':
      return new ValidationError('Null constraint violation');
    
    case 'P2012':
      return new ValidationError('Missing a required value');
    
    case 'P2013':
      return new ValidationError('Missing the required argument');
    
    case 'P2014':
      return new ValidationError('The change would violate a required relation');
    
    case 'P2015':
      return new ValidationError('A related record could not be found');
    
    case 'P2016':
      return new ValidationError('Query interpretation error');
    
    case 'P2017':
      return new ValidationError('The records for relation are not connected');
    
    case 'P2018':
      return new ValidationError('The required connected records were not found');
    
    case 'P2019':
      return new ValidationError('Input error');
    
    case 'P2020':
      return new ValidationError('Value out of range for the type');
    
    case 'P2021':
      return new NotFoundError('Table');
    
    case 'P2022':
      return new NotFoundError('Column');
    
    case 'P2023':
      return new ValidationError('Inconsistent column data');
    
    case 'P2024':
      return new AppError('Connection pool timeout', 504, 'CONNECTION_TIMEOUT');
    
    case 'P2025':
      return new NotFoundError('Record');
    
    case 'P2026':
      return new AppError('The current database provider doesn\'t support a feature', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2027':
      return new AppError('Multiple errors occurred during execution', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2028':
      return new AppError('Transaction API error', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2030':
      return new NotFoundError('Fulltext index');
    
    case 'P2031':
      return new AppError('Prisma needs to perform transactions', 500, ErrorCode.INTERNAL_ERROR);
    
    case 'P2033':
      return new ValidationError('A number out of range');
    
    case 'P2034':
      return new AppError('Transaction failed due to a write conflict', 409, ErrorCode.CONFLICT);
    
    default:
      return new AppError('Database operation failed', 500, ErrorCode.INTERNAL_ERROR);
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: any): AppError => {
  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token has expired');
  }
  
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token');
  }
  
  if (error.name === 'NotBeforeError') {
    return new UnauthorizedError('Token not active');
  }
  
  return new UnauthorizedError('Token verification failed');
};

/**
 * Handle validation errors
 */
const handleValidationError = (error: any): AppError => {
  if (error.isJoi) {
    const details = error.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
      value: detail.context?.value,
    }));
    
    return new ValidationError('Validation failed', details);
  }
  
  return new ValidationError(error.message);
};

/**
 * Handle multer (file upload) errors
 */
const handleMulterError = (error: any): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new FileUploadError('File too large', ErrorCode.FILE_TOO_LARGE);
    
    case 'LIMIT_FILE_COUNT':
      return new FileUploadError('Too many files');
    
    case 'LIMIT_FIELD_KEY':
      return new FileUploadError('Field name too long');
    
    case 'LIMIT_FIELD_VALUE':
      return new FileUploadError('Field value too long');
    
    case 'LIMIT_FIELD_COUNT':
      return new FileUploadError('Too many fields');
    
    case 'LIMIT_UNEXPECTED_FILE':
      return new FileUploadError('Unexpected field', ErrorCode.INVALID_FILE_TYPE);
    
    case 'MISSING_FIELD_NAME':
      return new FileUploadError('Field name missing');
    
    default:
      return new FileUploadError('File upload failed');
  }
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Handle different types of errors
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name.startsWith('Prisma')) {
    appError = handlePrismaError(error);
  } else if (error.name.includes('JsonWebToken') || error.name.includes('Token')) {
    appError = handleJWTError(error);
  } else if (error.name === 'ValidationError' || (error as any).isJoi) {
    appError = handleValidationError(error);
  } else if (error.name === 'MulterError') {
    appError = handleMulterError(error);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    appError = new ValidationError('Invalid JSON in request body');
  } else if (error.name === 'CastError') {
    appError = new ValidationError('Invalid data format');
  } else {
    // Handle unknown errors
    appError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : error.message,
      500,
      ErrorCode.INTERNAL_ERROR,
      false
    );
  }

  // Log error details
  const errorContext = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).auth?.userId,
    statusCode: appError.statusCode,
    errorCode: appError.code,
    isOperational: appError.isOperational,
    stack: error.stack,
  };

  if (appError.statusCode >= 500) {
    logger.error('Server Error', { error: appError.message, ...errorContext });
  } else if (appError.statusCode >= 400) {
    logger.warn('Client Error', { error: appError.message, ...errorContext });
  }

  // Send error response
  const response: any = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
    },
  };

  // Add error details in development or for validation errors
  if (appError.details && (process.env.NODE_ENV === 'development' || appError.code === ErrorCode.VALIDATION_ERROR)) {
    response.error.details = appError.details;
  }

  // Add stack trace in development for server errors
  if (process.env.NODE_ENV === 'development' && appError.statusCode >= 500) {
    response.error.stack = error.stack;
  }

  res.status(appError.statusCode).json(response);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', { reason, promise });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Setup error handlers
 */
export const setupErrorHandlers = (): void => {
  handleUncaughtException();
  handleUnhandledRejection();
};