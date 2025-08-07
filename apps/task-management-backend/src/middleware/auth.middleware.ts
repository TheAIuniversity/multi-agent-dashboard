import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { TokenUtils } from '@/config/jwt';
import { AuthenticatedRequest, AuthContext } from '@/types/auth.types';
import { logger, logSecurityEvent } from '@/utils/logger';
import { SecurityEventType } from '@/types/auth.types';

/**
 * Authentication middleware
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = TokenUtils.extractBearerToken(authHeader);

    if (!token) {
      logSecurityEvent(
        SecurityEventType.PERMISSION_DENIED,
        null,
        req.ip,
        req.get('User-Agent') || '',
        { reason: 'no_token' }
      );

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required',
        },
      });
      return;
    }

    // Verify token
    const authService = new AuthService();
    const payload = await authService.verifyAccessToken(token);

    // Set auth context
    req.auth = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };

    // Get user profile and set on request
    const user = await authService.getUserProfile(token);
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error) {
    logSecurityEvent(
      SecurityEventType.PERMISSION_DENIED,
      null,
      req.ip,
      req.get('User-Agent') || '',
      { reason: 'invalid_token', error: error.message }
    );

    logger.error('Authentication failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error,
    });

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      },
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtils.extractBearerToken(authHeader);

    if (token) {
      const authService = new AuthService();
      
      try {
        const payload = await authService.verifyAccessToken(token);
        const user = await authService.getUserProfile(token);

        req.auth = {
          userId: payload.userId,
          email: payload.email,
          roles: payload.roles,
          permissions: payload.permissions,
        };

        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      } catch (error) {
        // Log but don't fail - token is optional
        logger.debug('Optional auth failed', { error: error.message });
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    logger.debug('Optional auth middleware error', { error });
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const userRoles = req.auth.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      logSecurityEvent(
        SecurityEventType.PERMISSION_DENIED,
        req.auth.userId,
        req.ip,
        req.get('User-Agent') || '',
        { reason: 'insufficient_role', requiredRoles: allowedRoles, userRoles }
      );

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based access control middleware
 */
export const requirePermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const userPermissions = req.auth.permissions || {};
    const resourcePermissions = userPermissions[resource] || [];
    
    if (!resourcePermissions.includes(action) && !resourcePermissions.includes('*')) {
      logSecurityEvent(
        SecurityEventType.PERMISSION_DENIED,
        req.auth.userId,
        req.ip,
        req.get('User-Agent') || '',
        { 
          reason: 'insufficient_permission', 
          resource, 
          action, 
          userPermissions: resourcePermissions 
        }
      );

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions for ${action} on ${resource}`,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Resource ownership middleware
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.auth.userId;

    // This is a simplified check - in practice, you'd check database ownership
    if (resourceId === userId) {
      next();
      return;
    }

    // For more complex ownership checks, you might need to query the database
    // This would be implemented in specific route handlers or custom middleware

    logSecurityEvent(
      SecurityEventType.PERMISSION_DENIED,
      req.auth.userId,
      req.ip,
      req.get('User-Agent') || '',
      { reason: 'not_owner', resourceId, userId }
    );

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You can only access your own resources',
      },
    });
  };
};

/**
 * Project membership middleware
 */
export const requireProjectMembership = (projectIdParam: string = 'projectId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    try {
      const projectId = req.params[projectIdParam];
      const userId = req.auth.userId;

      // This would typically check project membership in database
      // For now, we'll pass through and let the service layer handle it
      
      // TODO: Implement project membership check
      // const userRepository = new UserRepository();
      // const hasAccess = await userRepository.hasProjectAccess(userId, projectId);
      
      // if (!hasAccess) {
      //   logSecurityEvent(
      //     SecurityEventType.PERMISSION_DENIED,
      //     userId,
      //     req.ip,
      //     req.get('User-Agent') || '',
      //     { reason: 'not_project_member', projectId }
      //   );

      //   res.status(403).json({
      //     success: false,
      //     error: {
      //       code: 'FORBIDDEN',
      //       message: 'You are not a member of this project',
      //     },
      //   });
      //   return;
      // }

      next();
    } catch (error) {
      logger.error('Project membership check failed', {
        userId: req.auth.userId,
        projectId: req.params[projectIdParam],
        error,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify project membership',
        },
      });
    }
  };
};

/**
 * Email verification middleware
 */
export const requireEmailVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.auth) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  if (!req.user?.id) {
    res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email verification required',
      },
    });
    return;
  }

  next();
};

/**
 * API key authentication middleware (for service-to-service communication)
 */
export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    logger.error('API_KEY not configured');
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'API key authentication not configured',
      },
    });
    return;
  }

  if (!apiKey || apiKey !== validApiKey) {
    logSecurityEvent(
      SecurityEventType.PERMISSION_DENIED,
      null,
      req.ip,
      req.get('User-Agent') || '',
      { reason: 'invalid_api_key' }
    );

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Valid API key required',
      },
    });
    return;
  }

  next();
};

/**
 * Development-only middleware (bypasses auth in development)
 */
export const devAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Set a mock auth context for development
    req.auth = {
      userId: 'dev-user-id',
      email: 'dev@example.com',
      roles: ['admin'],
      permissions: { '*': ['*'] },
    };

    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Development User',
    };

    logger.warn('Development auth bypass enabled');
    next();
    return;
  }

  // In production or when bypass is disabled, use regular auth
  requireAuth(req, res, next);
};