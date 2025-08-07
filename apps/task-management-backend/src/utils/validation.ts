import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/repositories/base.repository';

// Common validation patterns
const patterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  phoneNumber: /^\+?[1-9]\d{1,14}$/,
};

// Custom Joi validators
const customValidators = {
  uuid: Joi.string().pattern(patterns.uuid).message('Must be a valid UUID'),
  email: Joi.string().email().max(255).lowercase().trim(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(patterns.password)
    .message('Password must contain at least 8 characters with uppercase, lowercase, number, and special character'),
  name: Joi.string().min(1).max(100).trim(),
  description: Joi.string().max(2000).allow('').trim(),
  title: Joi.string().min(1).max(200).trim(),
  slug: Joi.string().pattern(patterns.slug).max(50),
  url: Joi.string().uri().max(500),
  phoneNumber: Joi.string().pattern(patterns.phoneNumber),
};

// Validation schemas
export const validationSchemas = {
  // Authentication schemas
  register: Joi.object({
    email: customValidators.email.required(),
    password: customValidators.password.required(),
    name: customValidators.name.required(),
    avatarUrl: customValidators.url.optional(),
  }),

  login: Joi.object({
    email: customValidators.email.required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: customValidators.password.required(),
  }),

  // User schemas
  updateUser: Joi.object({
    name: customValidators.name.optional(),
    avatarUrl: customValidators.url.allow(null).optional(),
  }),

  // Task schemas
  createTask: Joi.object({
    projectId: customValidators.uuid.required(),
    title: customValidators.title.required(),
    description: customValidators.description.optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    assigneeId: customValidators.uuid.allow(null).optional(),
    dueDate: Joi.date().greater('now').allow(null).optional(),
  }),

  updateTask: Joi.object({
    title: customValidators.title.optional(),
    description: customValidators.description.optional(),
    status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    assigneeId: customValidators.uuid.allow(null).optional(),
    dueDate: Joi.date().allow(null).optional(),
  }),

  taskFilters: Joi.object({
    status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    assigneeId: customValidators.uuid.optional(),
    search: Joi.string().max(200).optional(),
    dueBefore: Joi.date().optional(),
    dueAfter: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  // Project schemas
  createProject: Joi.object({
    name: customValidators.title.required(),
    description: customValidators.description.optional(),
    organizationId: customValidators.uuid.optional(),
  }),

  updateProject: Joi.object({
    name: customValidators.title.optional(),
    description: customValidators.description.optional(),
    status: Joi.string().valid('active', 'archived', 'completed').optional(),
  }),

  addProjectMember: Joi.object({
    userId: customValidators.uuid.required(),
    role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
  }),

  updateProjectMember: Joi.object({
    role: Joi.string().valid('owner', 'admin', 'member', 'viewer').required(),
  }),

  // Organization schemas
  createOrganization: Joi.object({
    name: customValidators.title.required(),
    description: customValidators.description.optional(),
  }),

  updateOrganization: Joi.object({
    name: customValidators.title.optional(),
    description: customValidators.description.optional(),
  }),

  // Team schemas
  createTeam: Joi.object({
    organizationId: customValidators.uuid.required(),
    name: customValidators.title.required(),
    description: customValidators.description.optional(),
  }),

  updateTeam: Joi.object({
    name: customValidators.title.optional(),
    description: customValidators.description.optional(),
  }),

  addTeamMember: Joi.object({
    userId: customValidators.uuid.required(),
    role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
  }),

  // Comment schemas
  createComment: Joi.object({
    content: Joi.string().min(1).max(2000).required().trim(),
  }),

  updateComment: Joi.object({
    content: Joi.string().min(1).max(2000).required().trim(),
  }),

  // Search schemas
  search: Joi.object({
    query: Joi.string().min(1).max(200).required().trim(),
    type: Joi.string().valid('tasks', 'projects', 'users').optional(),
    projectId: customValidators.uuid.optional(),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),

  // Notification schemas
  updateNotification: Joi.object({
    read: Joi.boolean().required(),
  }),

  // Common parameter schemas
  params: {
    id: Joi.object({
      id: customValidators.uuid.required(),
    }),
    
    taskId: Joi.object({
      taskId: customValidators.uuid.required(),
    }),
    
    projectId: Joi.object({
      projectId: customValidators.uuid.required(),
    }),
    
    userId: Joi.object({
      userId: customValidators.uuid.required(),
    }),
    
    organizationId: Joi.object({
      organizationId: customValidators.uuid.required(),
    }),
    
    teamId: Joi.object({
      teamId: customValidators.uuid.required(),
    }),
    
    commentId: Joi.object({
      commentId: customValidators.uuid.required(),
    }),
  },

  // Pagination schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    cursor: Joi.string().optional(),
  }),

  // Analytics schemas
  analyticsFilters: Joi.object({
    projectId: customValidators.uuid.optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  }),

  // File upload schemas
  fileUpload: Joi.object({
    filename: Joi.string().max(255).required(),
    mimetype: Joi.string().max(100).required(),
    size: Joi.number().integer().max(10485760).required(), // 10MB
  }),
};

/**
 * Validation middleware factory
 */
export const validateRequest = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationErrors,
        },
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate multiple properties
 */
export const validateMultiple = (validations: {
  [key in 'body' | 'query' | 'params']?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    for (const [property, schema] of Object.entries(validations)) {
      const { error, value } = schema.validate(req[property as keyof typeof validations], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `${property}.${detail.path.join('.')}`,
          message: detail.message.replace(/"/g, ''),
          value: detail.context?.value,
        })));
      } else {
        req[property as keyof typeof validations] = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors,
        },
      });
    }

    next();
  };
};

/**
 * Sanitization utilities
 */
export const sanitizers = {
  /**
   * Sanitize string input
   */
  string: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  /**
   * Sanitize email
   */
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize search query
   */
  searchQuery: (input: string): string => {
    return input.trim().replace(/[<>'"&]/g, '').substring(0, 200);
  },

  /**
   * Sanitize HTML content
   */
  html: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Remove null bytes and control characters
   */
  removeControlChars: (input: string): string => {
    return input.replace(/[\x00-\x1F\x7F]/g, '');
  },
};

/**
 * Custom validation functions
 */
export const customValidations = {
  /**
   * Validate password strength
   */
  isStrongPassword: (password: string): boolean => {
    return patterns.password.test(password);
  },

  /**
   * Validate UUID format
   */
  isValidUuid: (uuid: string): boolean => {
    return patterns.uuid.test(uuid);
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return patterns.email.test(email);
  },

  /**
   * Check if date is in the future
   */
  isFutureDate: (date: Date): boolean => {
    return date > new Date();
  },

  /**
   * Check if string contains only allowed characters
   */
  hasOnlyAllowedChars: (input: string, allowedPattern: RegExp): boolean => {
    return allowedPattern.test(input);
  },

  /**
   * Validate file extension
   */
  isAllowedFileExtension: (filename: string, allowedExtensions: string[]): boolean => {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedExtensions.includes(extension) : false;
  },

  /**
   * Validate MIME type
   */
  isAllowedMimeType: (mimeType: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(mimeType);
  },
};

/**
 * Validation error formatter
 */
export const formatValidationError = (error: Joi.ValidationError) => {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value,
      })),
    },
  };
};

/**
 * Validate and sanitize user input
 */
export const validateAndSanitize = <T>(
  data: any,
  schema: Joi.ObjectSchema<T>
): { isValid: boolean; data?: T; errors?: any[] } => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value,
      })),
    };
  }

  return {
    isValid: true,
    data: value,
  };
};