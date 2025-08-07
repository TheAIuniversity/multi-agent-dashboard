import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, RefreshTokenPayload, JwtConfig } from '@/types/auth.types';
import { logger } from '@/utils/logger';

// JWT Configuration
export const jwtConfig: JwtConfig = {
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  algorithm: 'RS256',
  issuer: process.env.JWT_ISSUER || 'task-management-app',
  audience: process.env.JWT_AUDIENCE || 'task-management-users',
};

// Get JWT keys from environment variables
function getJwtKeys() {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  const publicKey = process.env.JWT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be set in environment variables');
  }

  // Decode base64 encoded keys
  try {
    return {
      privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
      publicKey: Buffer.from(publicKey, 'base64').toString('utf-8'),
    };
  } catch (error) {
    throw new Error('Invalid base64 encoded JWT keys');
  }
}

// JWT Service Class
export class JwtService {
  private static privateKey: string;
  private static publicKey: string;

  static {
    try {
      const keys = getJwtKeys();
      JwtService.privateKey = keys.privateKey;
      JwtService.publicKey = keys.publicKey;
    } catch (error) {
      logger.error('Failed to initialize JWT keys', error);
      throw error;
    }
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
    try {
      return jwt.sign(payload, JwtService.privateKey, {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.accessTokenExpiry,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });
    } catch (error) {
      logger.error('Failed to generate access token', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JwtService.privateKey, {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.refreshTokenExpiry,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });
    } catch (error) {
      logger.error('Failed to generate refresh token', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JwtService.publicKey, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        logger.error('Access token verification failed', error);
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, JwtService.publicKey, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Refresh token verification failed', error);
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for inspection)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Token decode failed', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get token expiration', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = JwtService.getTokenExpiration(token);
    if (!expiration) return true;
    return new Date() > expiration;
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiration(token: string): number {
    const expiration = JwtService.getTokenExpiration(token);
    if (!expiration) return 0;
    
    const timeUntilExpiration = Math.floor((expiration.getTime() - Date.now()) / 1000);
    return Math.max(0, timeUntilExpiration);
  }
}

// Utility functions for token management
export const TokenUtils = {
  /**
   * Generate a secure random token ID
   */
  generateTokenId(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Hash a token for storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /**
   * Generate secure random bytes
   */
  generateSecureRandom(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Create CSRF token
   */
  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  },

  /**
   * Extract token from Authorization header
   */
  extractBearerToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  },

  /**
   * Get access token expiry in seconds
   */
  getAccessTokenExpirySeconds(): number {
    const expiry = jwtConfig.accessTokenExpiry;
    if (expiry.endsWith('m')) {
      return parseInt(expiry.slice(0, -1)) * 60;
    } else if (expiry.endsWith('h')) {
      return parseInt(expiry.slice(0, -1)) * 3600;
    } else if (expiry.endsWith('d')) {
      return parseInt(expiry.slice(0, -1)) * 86400;
    } else if (expiry.endsWith('s')) {
      return parseInt(expiry.slice(0, -1));
    } else {
      return 900; // Default 15 minutes
    }
  },

  /**
   * Get refresh token expiry in seconds
   */
  getRefreshTokenExpirySeconds(): number {
    const expiry = jwtConfig.refreshTokenExpiry;
    if (expiry.endsWith('m')) {
      return parseInt(expiry.slice(0, -1)) * 60;
    } else if (expiry.endsWith('h')) {
      return parseInt(expiry.slice(0, -1)) * 3600;
    } else if (expiry.endsWith('d')) {
      return parseInt(expiry.slice(0, -1)) * 86400;
    } else if (expiry.endsWith('s')) {
      return parseInt(expiry.slice(0, -1));
    } else {
      return 604800; // Default 7 days
    }
  },
};

// Generate RSA key pair for JWT (utility function for setup)
export function generateJwtKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    privateKey: Buffer.from(privateKey).toString('base64'),
    publicKey: Buffer.from(publicKey).toString('base64'),
  };
}