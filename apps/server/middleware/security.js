import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

/**
 * Configure Helmet for security headers including CSP
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for Vite dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws://localhost:*", "http://localhost:*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
});

/**
 * Rate limiting configuration
 */
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // Time window
    max, // Max requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * General API rate limiter
 */
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

/**
 * Strict rate limiter for event submission
 */
export const eventLimiter = createRateLimiter(1 * 60 * 1000, 30); // 30 events per minute

/**
 * Event validation rules
 */
export const validateEvent = [
  body('app')
    .notEmpty().withMessage('App name is required')
    .isString().withMessage('App name must be a string')
    .matches(/^[a-zA-Z0-9-_]+$/).withMessage('App name contains invalid characters')
    .isLength({ max: 50 }).withMessage('App name too long'),
  
  body('session_id')
    .notEmpty().withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string')
    .matches(/^[a-zA-Z0-9-]+$/).withMessage('Session ID contains invalid characters')
    .isLength({ min: 8, max: 64 }).withMessage('Invalid session ID length'),
  
  body('event_type')
    .notEmpty().withMessage('Event type is required')
    .isIn([
      'PreToolUse',
      'PostToolUse',
      'Notification',
      'Stop',
      'SubAgentStop',
      'UserPromptSubmit',
      'PreCompact',
      'AgentComplete',
      'AgentCompletionNotification'
    ]).withMessage('Invalid event type'),
  
  body('payload')
    .optional()
    .isObject().withMessage('Payload must be an object'),
  
  body('summary')
    .optional()
    .isString().withMessage('Summary must be a string')
    .isLength({ max: 500 }).withMessage('Summary too long'),
  
  body('timestamp')
    .optional()
    .isISO8601().withMessage('Invalid timestamp format')
];

/**
 * Task validation rules
 */
export const validateTask = [
  body('title')
    .notEmpty().withMessage('Task title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ max: 200 }).withMessage('Title too long'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 1000 }).withMessage('Description too long'),
  
  body('agent_id')
    .notEmpty().withMessage('Agent ID is required')
    .isString().withMessage('Agent ID must be a string')
    .matches(/^[a-zA-Z0-9-_]+$/).withMessage('Agent ID contains invalid characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level')
];

/**
 * Agent completion validation rules
 */
export const validateAgentCompletion = [
  body('agent_id')
    .notEmpty().withMessage('Agent ID is required')
    .isString().withMessage('Agent ID must be a string')
    .matches(/^[a-zA-Z0-9-_]+$/).withMessage('Agent ID contains invalid characters'),
  
  body('session_id')
    .notEmpty().withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string')
    .matches(/^[a-zA-Z0-9-]+$/).withMessage('Session ID contains invalid characters'),
  
  body('summary')
    .notEmpty().withMessage('Summary is required')
    .isString().withMessage('Summary must be a string')
    .isLength({ max: 500 }).withMessage('Summary too long'),
  
  body('status')
    .optional()
    .isIn(['success', 'failed', 'partial']).withMessage('Invalid status')
];

/**
 * Chat transcript validation rules
 */
export const validateChatTranscript = [
  body('transcript')
    .isArray().withMessage('Transcript must be an array')
    .custom((value) => {
      // Validate each message in the transcript
      for (const msg of value) {
        if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
          throw new Error('Invalid message role');
        }
        if (!msg.content || typeof msg.content !== 'string') {
          throw new Error('Invalid message content');
        }
        if (msg.content.length > 10000) {
          throw new Error('Message content too long');
        }
      }
      return true;
    })
];

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in the request body
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove any potential script tags or dangerous content
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};