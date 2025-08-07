import { RefreshToken, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError } from './base.repository';
import { TokenUtils } from '@/config/jwt';
import { logger } from '@/utils/logger';

export interface RefreshTokenDto {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateRefreshTokenDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<RefreshTokenDto | null>;
  findByUserId(userId: string): Promise<RefreshTokenDto[]>;
  deleteByToken(token: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
  cleanupExpiredTokens(): Promise<void>;
}

/**
 * Refresh Token Repository
 */
export class RefreshTokenRepository 
  extends BaseRepository<RefreshTokenDto, CreateRefreshTokenDto, never> 
  implements IRefreshTokenRepository {
  
  constructor() {
    super('RefreshToken');
  }

  protected getModel() {
    return this.db.refreshToken;
  }

  protected transformToDto(entity: RefreshToken): RefreshTokenDto {
    return {
      id: entity.id,
      userId: entity.userId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    };
  }

  protected prepareCreateData(data: CreateRefreshTokenDto): Prisma.RefreshTokenCreateInput {
    return {
      id: data.id,
      user: { connect: { id: data.userId } },
      tokenHash: TokenUtils.hashToken(data.token),
      expiresAt: data.expiresAt,
    };
  }

  protected prepareUpdateData(data: never): never {
    throw new Error('Refresh tokens cannot be updated');
  }

  protected buildWhereClause(filters: any): Prisma.RefreshTokenWhereInput {
    const where: Prisma.RefreshTokenWhereInput = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.notExpired) {
      where.expiresAt = {
        gt: new Date(),
      };
    }
    
    if (filters.expired) {
      where.expiresAt = {
        lte: new Date(),
      };
    }
    
    return where;
  }

  protected getDefaultOrder() {
    return {
      orderBy: { createdAt: 'desc' },
    };
  }

  /**
   * Find refresh token by token value
   */
  async findByToken(token: string): Promise<RefreshTokenDto | null> {
    try {
      const tokenHash = TokenUtils.hashToken(token);
      
      const refreshToken = await this.db.refreshToken.findFirst({
        where: { tokenHash },
      });
      
      return refreshToken ? this.transformToDto(refreshToken) : null;
    } catch (error) {
      logger.error('Failed to find refresh token by token', { error });
      throw error;
    }
  }

  /**
   * Find all refresh tokens for a user
   */
  async findByUserId(userId: string): Promise<RefreshTokenDto[]> {
    try {
      const refreshTokens = await this.db.refreshToken.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      
      return refreshTokens.map(token => this.transformToDto(token));
    } catch (error) {
      logger.error('Failed to find refresh tokens by user ID', { userId, error });
      throw error;
    }
  }

  /**
   * Delete refresh token by token value
   */
  async deleteByToken(token: string): Promise<void> {
    try {
      const tokenHash = TokenUtils.hashToken(token);
      
      const result = await this.db.refreshToken.deleteMany({
        where: { tokenHash },
      });
      
      if (result.count === 0) {
        logger.warn('Attempted to delete non-existent refresh token');
      } else {
        logger.info('Refresh token deleted', { count: result.count });
      }
    } catch (error) {
      logger.error('Failed to delete refresh token by token', { error });
      throw error;
    }
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteAllForUser(userId: string): Promise<void> {
    try {
      const result = await this.db.refreshToken.deleteMany({
        where: { userId },
      });
      
      logger.info('All refresh tokens deleted for user', { 
        userId, 
        count: result.count 
      });
    } catch (error) {
      logger.error('Failed to delete all refresh tokens for user', { userId, error });
      throw error;
    }
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpired(): Promise<number> {
    try {
      const result = await this.db.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });
      
      if (result.count > 0) {
        logger.info('Expired refresh tokens deleted', { count: result.count });
      }
      
      return result.count;
    } catch (error) {
      logger.error('Failed to delete expired refresh tokens', { error });
      throw error;
    }
  }

  /**
   * Get refresh token statistics
   */
  async getTokenStats(): Promise<{
    total: number;
    expired: number;
    active: number;
    expiringInHour: number;
  }> {
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const [total, expired, active, expiringInHour] = await Promise.all([
        this.db.refreshToken.count(),
        this.db.refreshToken.count({
          where: { expiresAt: { lte: now } },
        }),
        this.db.refreshToken.count({
          where: { expiresAt: { gt: now } },
        }),
        this.db.refreshToken.count({
          where: {
            expiresAt: {
              gt: now,
              lte: inOneHour,
            },
          },
        }),
      ]);

      return {
        total,
        expired,
        active,
        expiringInHour,
      };
    } catch (error) {
      logger.error('Failed to get token stats', { error });
      throw error;
    }
  }

  /**
   * Clean up expired tokens (maintenance task)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const deletedCount = await this.deleteExpired();
      
      if (deletedCount > 0) {
        logger.info('Refresh token cleanup completed', { deletedCount });
      }
    } catch (error) {
      logger.error('Refresh token cleanup failed', { error });
      throw error;
    }
  }

  /**
   * Get tokens expiring soon (for cleanup warnings)
   */
  async findExpiringSoon(hours: number = 24): Promise<RefreshTokenDto[]> {
    try {
      const expirationThreshold = new Date();
      expirationThreshold.setHours(expirationThreshold.getHours() + hours);

      const tokens = await this.db.refreshToken.findMany({
        where: {
          expiresAt: {
            gt: new Date(),
            lte: expirationThreshold,
          },
        },
        orderBy: { expiresAt: 'asc' },
      });

      return tokens.map(token => this.transformToDto(token));
    } catch (error) {
      logger.error('Failed to find tokens expiring soon', { hours, error });
      throw error;
    }
  }

  /**
   * Count active tokens for a user
   */
  async countActiveForUser(userId: string): Promise<number> {
    try {
      return await this.db.refreshToken.count({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
      });
    } catch (error) {
      logger.error('Failed to count active tokens for user', { userId, error });
      throw error;
    }
  }

  /**
   * Get user's most recent token
   */
  async findMostRecentForUser(userId: string): Promise<RefreshTokenDto | null> {
    try {
      const token = await this.db.refreshToken.findFirst({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      return token ? this.transformToDto(token) : null;
    } catch (error) {
      logger.error('Failed to find most recent token for user', { userId, error });
      throw error;
    }
  }

  /**
   * Revoke token by ID
   */
  async revokeById(id: string): Promise<void> {
    try {
      await this.db.refreshToken.delete({
        where: { id },
      });
      
      logger.info('Refresh token revoked', { tokenId: id });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('RefreshToken', id);
      }
      logger.error('Failed to revoke refresh token', { id, error });
      throw error;
    }
  }

  /**
   * Bulk revoke tokens for multiple users
   */
  async revokeForUsers(userIds: string[]): Promise<number> {
    try {
      const result = await this.db.refreshToken.deleteMany({
        where: {
          userId: { in: userIds },
        },
      });

      logger.info('Bulk refresh token revocation completed', {
        userCount: userIds.length,
        tokenCount: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to bulk revoke refresh tokens', { userIds, error });
      throw error;
    }
  }
}