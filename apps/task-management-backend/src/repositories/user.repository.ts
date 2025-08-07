import { User, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError, DuplicateError } from './base.repository';
import { UserProfile, CreateUserDto, UpdateUserDto } from '@/types/api.types';
import { logger } from '@/utils/logger';

/**
 * User repository interface
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserProfile | null>;
  findByEmailWithPassword(email: string): Promise<(UserProfile & { passwordHash: string }) | null>;
  createUser(data: CreateUserDto): Promise<UserProfile>;
  updateUser(id: string, data: UpdateUserDto): Promise<UserProfile>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  verifyEmail(id: string): Promise<UserProfile>;
  searchUsers(query: string, excludeIds?: string[]): Promise<UserProfile[]>;
  getUsersById(ids: string[]): Promise<UserProfile[]>;
  getUserStats(id: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }>;
}

/**
 * User repository implementation
 */
export class UserRepository extends BaseRepository<UserProfile, CreateUserDto, UpdateUserDto> implements IUserRepository {
  constructor() {
    super('User');
  }

  protected getModel() {
    return this.db.user;
  }

  protected transformToDto(entity: any): UserProfile {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      avatarUrl: entity.avatarUrl,
      emailVerified: entity.emailVerified,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  protected prepareCreateData(data: CreateUserDto): Prisma.UserCreateInput {
    return {
      email: data.email.toLowerCase().trim(),
      passwordHash: '', // This will be set by the service layer
      name: data.name.trim(),
      avatarUrl: data.avatarUrl,
      emailVerified: false,
    };
  }

  protected prepareUpdateData(data: UpdateUserDto): Prisma.UserUpdateInput {
    const updateData: Prisma.UserUpdateInput = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }
    
    updateData.updatedAt = new Date();
    
    return updateData;
  }

  protected buildWhereClause(filters: any): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    
    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }
    
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }
    
    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }
    
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      where.id = {
        notIn: filters.excludeIds,
      };
    }
    
    return where;
  }

  protected getDefaultOrder() {
    return {
      orderBy: { name: 'asc' },
    };
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      
      return user ? this.transformToDto(user) : null;
    } catch (error) {
      logger.error('Failed to find user by email', { email, error });
      throw error;
    }
  }

  /**
   * Find user by email with password hash (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<(UserProfile & { passwordHash: string }) | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      
      if (!user) return null;
      
      return {
        ...this.transformToDto(user),
        passwordHash: user.passwordHash,
      };
    } catch (error) {
      logger.error('Failed to find user by email with password', { email, error });
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDto): Promise<UserProfile> {
    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new DuplicateError('User', 'email', data.email);
      }

      const userData = this.prepareCreateData(data);
      const user = await this.db.user.create({
        data: userData,
      });
      
      logger.info('User created', { userId: user.id, email: user.email });
      return this.transformToDto(user);
    } catch (error) {
      if (error instanceof DuplicateError) {
        throw error;
      }
      logger.error('Failed to create user', { data, error });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<UserProfile> {
    try {
      const updateData = this.prepareUpdateData(data);
      const user = await this.db.user.update({
        where: { id },
        data: updateData,
      });
      
      logger.info('User updated', { userId: id });
      return this.transformToDto(user);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      logger.error('Failed to update user', { id, data, error });
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    try {
      await this.db.user.update({
        where: { id },
        data: { 
          passwordHash,
          updatedAt: new Date(),
        },
      });
      
      logger.info('User password updated', { userId: id });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      logger.error('Failed to update user password', { id, error });
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<UserProfile> {
    try {
      const user = await this.db.user.update({
        where: { id },
        data: { 
          emailVerified: true,
          updatedAt: new Date(),
        },
      });
      
      logger.info('User email verified', { userId: id });
      return this.transformToDto(user);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      logger.error('Failed to verify user email', { id, error });
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, excludeIds: string[] = []): Promise<UserProfile[]> {
    try {
      const users = await this.db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
            excludeIds.length > 0 ? {
              id: { notIn: excludeIds },
            } : {},
          ],
        },
        take: 50, // Limit search results
        orderBy: { name: 'asc' },
      });
      
      return users.map(user => this.transformToDto(user));
    } catch (error) {
      logger.error('Failed to search users', { query, excludeIds, error });
      throw error;
    }
  }

  /**
   * Get multiple users by IDs
   */
  async getUsersById(ids: string[]): Promise<UserProfile[]> {
    try {
      const users = await this.db.user.findMany({
        where: { id: { in: ids } },
        orderBy: { name: 'asc' },
      });
      
      return users.map(user => this.transformToDto(user));
    } catch (error) {
      logger.error('Failed to get users by IDs', { ids, error });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }> {
    try {
      // Check if user exists
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundError('User', id);
      }

      const [projectCount, taskStats] = await Promise.all([
        // Count projects user is a member of
        this.db.projectMember.count({
          where: { userId: id },
        }),
        
        // Get task statistics
        this.db.task.groupBy({
          by: ['status'],
          where: {
            OR: [
              { assigneeId: id },
              { createdBy: id },
            ],
          },
          _count: true,
        }),
      ]);

      // Count overdue tasks
      const overdueTasks = await this.db.task.count({
        where: {
          OR: [
            { assigneeId: id },
            { createdBy: id },
          ],
          dueDate: {
            lt: new Date(),
          },
          status: {
            not: 'done',
          },
        },
      });

      const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count, 0);
      const completedTasks = taskStats.find(stat => stat.status === 'done')?._count || 0;

      return {
        totalProjects: projectCount,
        totalTasks,
        completedTasks,
        overdueTasks,
      };
    } catch (error) {
      logger.error('Failed to get user stats', { id, error });
      throw error;
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(id: string, days: number = 30): Promise<{
    tasksCreated: number;
    tasksCompleted: number;
    commentsAdded: number;
    projectsJoined: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [tasksCreated, tasksCompleted, commentsAdded, projectsJoined] = await Promise.all([
        this.db.task.count({
          where: {
            createdBy: id,
            createdAt: { gte: startDate },
          },
        }),
        
        this.db.task.count({
          where: {
            assigneeId: id,
            status: 'done',
            updatedAt: { gte: startDate },
          },
        }),
        
        this.db.taskComment.count({
          where: {
            userId: id,
            createdAt: { gte: startDate },
          },
        }),
        
        this.db.projectMember.count({
          where: {
            userId: id,
            joinedAt: { gte: startDate },
          },
        }),
      ]);

      return {
        tasksCreated,
        tasksCompleted,
        commentsAdded,
        projectsJoined,
      };
    } catch (error) {
      logger.error('Failed to get user activity', { id, days, error });
      throw error;
    }
  }

  /**
   * Check if user has access to project
   */
  async hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
    try {
      const membership = await this.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });
      
      return !!membership;
    } catch (error) {
      logger.error('Failed to check project access', { userId, projectId, error });
      return false;
    }
  }

  /**
   * Get user's project role
   */
  async getProjectRole(userId: string, projectId: string): Promise<string | null> {
    try {
      const membership = await this.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        select: { role: true },
      });
      
      return membership?.role || null;
    } catch (error) {
      logger.error('Failed to get project role', { userId, projectId, error });
      return null;
    }
  }
}