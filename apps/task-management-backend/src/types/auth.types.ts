import { Request } from 'express';
import { UserRole } from '@prisma/client';

// JWT Configuration
export interface JwtConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  algorithm: 'RS256';
  issuer: string;
  audience: string;
}

// Token Payload
export interface TokenPayload {
  userId: string;
  email: string;
  roles?: string[];
  permissions?: Record<string, string[]>;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Refresh Token Payload
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

// Authentication Context
export interface AuthContext {
  userId: string;
  email: string;
  roles?: string[];
  permissions?: Record<string, string[]>;
}

// Extended Request Interface
export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
  user?: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

// Permission Types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  [role: string]: Permission[];
}

// Resource Permissions
export enum Resource {
  USER = 'user',
  PROJECT = 'project',
  TASK = 'task',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  NOTIFICATION = 'notification',
  ACTIVITY = 'activity',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  INVITE = 'invite',
  ASSIGN = 'assign',
  MANAGE = 'manage',
}

// Permission Checks
export interface PermissionCheck {
  userId: string;
  resource: Resource;
  action: Action;
  resourceId?: string;
  organizationId?: string;
  projectId?: string;
}

// Login Attempt Tracking
export interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
  failureReason?: string;
}

// Security Event Types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  TOKEN_REFRESH = 'token_refresh',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  details?: any;
  timestamp: Date;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// Password Policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidUserInfo: boolean;
}

// Session Types
export interface UserSession {
  userId: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

// OAuth Types (for future use)
export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
}

export interface OAuthUser {
  providerId: string;
  providerUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// Two-Factor Authentication (for future use)
export interface TwoFactorAuth {
  userId: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[];
  createdAt: Date;
}

export interface TwoFactorVerification {
  userId: string;
  code: string;
  type: 'totp' | 'sms' | 'backup';
}