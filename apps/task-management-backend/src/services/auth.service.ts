import { JwtService, TokenUtils } from '@/config/jwt';
import { PasswordService } from '@/utils/crypto';
import { UserRepository } from '@/repositories/user.repository';
import { RefreshTokenRepository } from '@/repositories/refresh-token.repository';
import { RedisService, CacheKeys } from '@/config/redis';
import { logger, logSecurityEvent } from '@/utils/logger';
import { 
  LoginDto, 
  RegisterDto, 
  AuthTokens, 
  TokenPayload, 
  RefreshTokenDto,
  ChangePasswordDto,
  UserProfile,
  CreateUserDto 
} from '@/types/api.types';
import { SecurityEventType } from '@/types/auth.types';

export class AuthenticationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Authentication Service
 */
export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDto, ip: string, userAgent: string): Promise<{
    user: UserProfile;
    tokens: AuthTokens;
  }> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        logSecurityEvent(
          SecurityEventType.LOGIN_FAILURE,
          null,
          ip,
          userAgent,
          { reason: 'email_already_exists', email: data.email }
        );
        throw new AuthenticationError('User with this email already exists', 'EMAIL_EXISTS');
      }

      // Hash password
      const passwordHash = await PasswordService.hashPassword(data.password);

      // Create user
      const createUserData: CreateUserDto = {
        email: data.email,
        password: data.password, // This will be ignored, we set the hash directly
        name: data.name,
      };

      // We need to handle password hashing in the repository
      const user = await this.userRepository.create({
        ...createUserData,
        passwordHash,
      } as any);

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email);

      // Log successful registration
      logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS,
        user.id,
        ip,
        userAgent,
        { action: 'register' }
      );

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        ip,
      });

      return { user, tokens };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Registration failed', { email: data.email, error });
      throw new AuthenticationError('Registration failed', 'REGISTRATION_ERROR');
    }
  }

  /**
   * Login user
   */
  async login(data: LoginDto, ip: string, userAgent: string): Promise<{
    user: UserProfile;
    tokens: AuthTokens;
  }> {
    try {
      // Find user with password
      const userWithPassword = await this.userRepository.findByEmailWithPassword(data.email);
      if (!userWithPassword) {
        logSecurityEvent(
          SecurityEventType.LOGIN_FAILURE,
          null,
          ip,
          userAgent,
          { reason: 'user_not_found', email: data.email }
        );
        throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Verify password
      const isValidPassword = await PasswordService.verifyPassword(
        data.password,
        userWithPassword.passwordHash
      );

      if (!isValidPassword) {
        logSecurityEvent(
          SecurityEventType.LOGIN_FAILURE,
          userWithPassword.id,
          ip,
          userAgent,
          { reason: 'invalid_password', email: data.email }
        );
        throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Check if email is verified
      if (!userWithPassword.emailVerified) {
        logSecurityEvent(
          SecurityEventType.LOGIN_FAILURE,
          userWithPassword.id,
          ip,
          userAgent,
          { reason: 'email_not_verified', email: data.email }
        );
        throw new AuthenticationError('Email not verified', 'EMAIL_NOT_VERIFIED');
      }

      // Generate tokens
      const tokens = await this.generateTokens(userWithPassword.id, userWithPassword.email);

      // Remove password hash from response
      const { passwordHash, ...user } = userWithPassword;

      // Log successful login
      logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS,
        user.id,
        ip,
        userAgent,
        { email: user.email }
      );

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ip,
      });

      return { user, tokens };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Login failed', { email: data.email, error });
      throw new AuthenticationError('Login failed', 'LOGIN_ERROR');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenDto, ip: string, userAgent: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(data.refreshToken);

      // Check if refresh token exists in database
      const storedToken = await this.refreshTokenRepository.findById(payload.tokenId);
      if (!storedToken || storedToken.userId !== payload.userId) {
        logSecurityEvent(
          SecurityEventType.TOKEN_REFRESH,
          payload.userId,
          ip,
          userAgent,
          { reason: 'invalid_refresh_token' }
        );
        throw new AuthenticationError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        // Clean up expired token
        await this.refreshTokenRepository.delete(storedToken.id);
        logSecurityEvent(
          SecurityEventType.TOKEN_REFRESH,
          payload.userId,
          ip,
          userAgent,
          { reason: 'refresh_token_expired' }
        );
        throw new AuthenticationError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
      }

      // Get user details
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        logSecurityEvent(
          SecurityEventType.TOKEN_REFRESH,
          payload.userId,
          ip,
          userAgent,
          { reason: 'user_not_found' }
        );
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(user.id, user.email);

      // Delete old refresh token
      await this.refreshTokenRepository.delete(storedToken.id);

      // Log successful token refresh
      logSecurityEvent(
        SecurityEventType.TOKEN_REFRESH,
        user.id,
        ip,
        userAgent,
        { success: true }
      );

      logger.info('Token refreshed successfully', {
        userId: user.id,
        email: user.email,
        ip,
      });

      return newTokens;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Token refresh failed', { error });
      throw new AuthenticationError('Token refresh failed', 'TOKEN_REFRESH_ERROR');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string, userId: string, ip: string, userAgent: string): Promise<void> {
    try {
      // Verify and decode refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Delete refresh token from database
      await this.refreshTokenRepository.deleteByToken(refreshToken);

      // Clear user cache
      await RedisService.delete(CacheKeys.user(userId));
      await RedisService.delete(CacheKeys.userProfile(userId));

      // Log logout
      logSecurityEvent(
        SecurityEventType.LOGOUT,
        userId,
        ip,
        userAgent
      );

      logger.info('User logged out successfully', {
        userId,
        ip,
      });
    } catch (error) {
      logger.error('Logout failed', { userId, error });
      // Don't throw error for logout - best effort cleanup
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    data: ChangePasswordDto,
    ip: string,
    userAgent: string
  ): Promise<void> {
    try {
      // Get user with current password
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
      }

      const userWithPassword = await this.userRepository.findByEmailWithPassword(user.email);
      if (!userWithPassword) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
      }

      // Verify current password
      const isValidPassword = await PasswordService.verifyPassword(
        data.currentPassword,
        userWithPassword.passwordHash
      );

      if (!isValidPassword) {
        logSecurityEvent(
          SecurityEventType.PASSWORD_CHANGE,
          userId,
          ip,
          userAgent,
          { success: false, reason: 'invalid_current_password' }
        );
        throw new AuthenticationError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }

      // Hash new password
      const newPasswordHash = await PasswordService.hashPassword(data.newPassword);

      // Update password
      await this.userRepository.updatePassword(userId, newPasswordHash);

      // Invalidate all refresh tokens for this user
      await this.refreshTokenRepository.deleteAllForUser(userId);

      // Clear user cache
      await RedisService.delete(CacheKeys.user(userId));

      // Log successful password change
      logSecurityEvent(
        SecurityEventType.PASSWORD_CHANGE,
        userId,
        ip,
        userAgent,
        { success: true }
      );

      logger.info('Password changed successfully', {
        userId,
        ip,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Password change failed', { userId, error });
      throw new AuthenticationError('Password change failed', 'PASSWORD_CHANGE_ERROR');
    }
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = JwtService.verifyAccessToken(token);

      // Check if user still exists and is active
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
      }

      if (!user.emailVerified) {
        throw new AuthenticationError('Email not verified', 'EMAIL_NOT_VERIFIED');
      }

      return payload;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid access token', 'INVALID_ACCESS_TOKEN');
    }
  }

  /**
   * Get user profile from token
   */
  async getUserProfile(token: string): Promise<UserProfile> {
    try {
      const payload = await this.verifyAccessToken(token);
      
      // Try to get user from cache first
      const cachedUser = await RedisService.get<UserProfile>(CacheKeys.userProfile(payload.userId));
      if (cachedUser) {
        return cachedUser;
      }

      // Get user from database
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
      }

      // Cache user profile for 1 hour
      await RedisService.set(CacheKeys.userProfile(payload.userId), user, 3600);

      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Failed to get user profile', { error });
      throw new AuthenticationError('Failed to get user profile', 'PROFILE_ERROR');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllTokens(userId: string, ip: string, userAgent: string): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteAllForUser(userId);
      
      // Clear user cache
      await RedisService.delete(CacheKeys.user(userId));
      await RedisService.delete(CacheKeys.userProfile(userId));

      logSecurityEvent(
        SecurityEventType.LOGOUT,
        userId,
        ip,
        userAgent,
        { action: 'revoke_all_tokens' }
      );

      logger.info('All tokens revoked for user', { userId, ip });
    } catch (error) {
      logger.error('Failed to revoke all tokens', { userId, error });
      throw new AuthenticationError('Failed to revoke tokens', 'TOKEN_REVOKE_ERROR');
    }
  }

  /**
   * Private: Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    try {
      // Generate token ID for refresh token
      const tokenId = TokenUtils.generateTokenId();

      // Create access token payload
      const accessTokenPayload = {
        userId,
        email,
      };

      // Create refresh token payload
      const refreshTokenPayload = {
        userId,
        tokenId,
      };

      // Generate tokens
      const accessToken = JwtService.generateAccessToken(accessTokenPayload);
      const refreshToken = JwtService.generateRefreshToken(refreshTokenPayload);

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + TokenUtils.getRefreshTokenExpirySeconds());

      await this.refreshTokenRepository.create({
        id: tokenId,
        userId,
        token: refreshToken,
        expiresAt,
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: TokenUtils.getAccessTokenExpirySeconds(),
      };
    } catch (error) {
      logger.error('Failed to generate tokens', { userId, error });
      throw new AuthenticationError('Token generation failed', 'TOKEN_GENERATION_ERROR');
    }
  }
}