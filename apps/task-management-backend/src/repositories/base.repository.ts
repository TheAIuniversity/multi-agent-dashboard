import { PrismaClient } from '@prisma/client';
import { db } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Base repository interface
 */
export interface IRepository<T, TCreateDto, TUpdateDto> {
  findById(id: string): Promise<T | null>;
  findMany(filters?: any): Promise<T[]>;
  create(data: TCreateDto): Promise<T>;
  update(id: string, data: TUpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  count(filters?: any): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T, TCreateDto, TUpdateDto> implements IRepository<T, TCreateDto, TUpdateDto> {
  protected db: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.db = db;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model delegate
   */
  protected abstract getModel(): any;

  /**
   * Transform database entity to DTO
   */
  protected abstract transformToDto(entity: any): T;

  /**
   * Prepare create data for database
   */
  protected abstract prepareCreateData(data: TCreateDto): any;

  /**
   * Prepare update data for database
   */
  protected abstract prepareUpdateData(data: TUpdateDto): any;

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const entity = await this.getModel().findUnique({
        where: { id },
        ...this.getDefaultInclude(),
      });
      
      return entity ? this.transformToDto(entity) : null;
    } catch (error) {
      logger.error(`Failed to find ${this.modelName} by ID`, { id, error });
      throw error;
    }
  }

  /**
   * Find multiple entities
   */
  async findMany(filters: any = {}): Promise<T[]> {
    try {
      const entities = await this.getModel().findMany({
        where: this.buildWhereClause(filters),
        ...this.getDefaultInclude(),
        ...this.getDefaultOrder(),
      });
      
      return entities.map(entity => this.transformToDto(entity));
    } catch (error) {
      logger.error(`Failed to find ${this.modelName} entities`, { filters, error });
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async create(data: TCreateDto): Promise<T> {
    try {
      const preparedData = this.prepareCreateData(data);
      const entity = await this.getModel().create({
        data: preparedData,
        ...this.getDefaultInclude(),
      });
      
      logger.info(`${this.modelName} created`, { id: entity.id });
      return this.transformToDto(entity);
    } catch (error) {
      logger.error(`Failed to create ${this.modelName}`, { data, error });
      throw error;
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: TUpdateDto): Promise<T> {
    try {
      const preparedData = this.prepareUpdateData(data);
      const entity = await this.getModel().update({
        where: { id },
        data: preparedData,
        ...this.getDefaultInclude(),
      });
      
      logger.info(`${this.modelName} updated`, { id });
      return this.transformToDto(entity);
    } catch (error) {
      logger.error(`Failed to update ${this.modelName}`, { id, data, error });
      throw error;
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.getModel().delete({
        where: { id },
      });
      
      logger.info(`${this.modelName} deleted`, { id });
    } catch (error) {
      logger.error(`Failed to delete ${this.modelName}`, { id, error });
      throw error;
    }
  }

  /**
   * Count entities
   */
  async count(filters: any = {}): Promise<number> {
    try {
      return await this.getModel().count({
        where: this.buildWhereClause(filters),
      });
    } catch (error) {
      logger.error(`Failed to count ${this.modelName} entities`, { filters, error });
      throw error;
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.getModel().findUnique({
        where: { id },
        select: { id: true },
      });
      
      return !!entity;
    } catch (error) {
      logger.error(`Failed to check ${this.modelName} existence`, { id, error });
      throw error;
    }
  }

  /**
   * Find with pagination
   */
  async findWithPagination(
    filters: any = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      const whereClause = this.buildWhereClause(filters);

      const [entities, total] = await Promise.all([
        this.getModel().findMany({
          where: whereClause,
          skip,
          take: limit,
          ...this.getDefaultInclude(),
          ...this.getDefaultOrder(),
        }),
        this.getModel().count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: entities.map(entity => this.transformToDto(entity)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error(`Failed to find ${this.modelName} with pagination`, { filters, page, limit, error });
      throw error;
    }
  }

  /**
   * Find with cursor-based pagination
   */
  async findWithCursor(
    filters: any = {},
    cursor?: string,
    limit: number = 20
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasNext: boolean;
  }> {
    try {
      const whereClause = this.buildWhereClause(filters);
      
      const entities = await this.getModel().findMany({
        where: whereClause,
        take: limit + 1, // Take one extra to check if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0, // Skip the cursor item itself
        ...this.getDefaultInclude(),
        ...this.getDefaultOrder(),
      });

      const hasNext = entities.length > limit;
      const data = hasNext ? entities.slice(0, -1) : entities;
      const nextCursor = hasNext ? entities[entities.length - 2].id : undefined;

      return {
        data: data.map(entity => this.transformToDto(entity)),
        nextCursor,
        hasNext,
      };
    } catch (error) {
      logger.error(`Failed to find ${this.modelName} with cursor`, { filters, cursor, limit, error });
      throw error;
    }
  }

  /**
   * Bulk create entities
   */
  async createMany(data: TCreateDto[]): Promise<{ count: number }> {
    try {
      const preparedData = data.map(item => this.prepareCreateData(item));
      const result = await this.getModel().createMany({
        data: preparedData,
        skipDuplicates: true,
      });
      
      logger.info(`Bulk created ${this.modelName} entities`, { count: result.count });
      return result;
    } catch (error) {
      logger.error(`Failed to bulk create ${this.modelName} entities`, { count: data.length, error });
      throw error;
    }
  }

  /**
   * Bulk update entities
   */
  async updateMany(filters: any, data: Partial<TUpdateDto>): Promise<{ count: number }> {
    try {
      const preparedData = this.prepareUpdateData(data as TUpdateDto);
      const result = await this.getModel().updateMany({
        where: this.buildWhereClause(filters),
        data: preparedData,
      });
      
      logger.info(`Bulk updated ${this.modelName} entities`, { count: result.count });
      return result;
    } catch (error) {
      logger.error(`Failed to bulk update ${this.modelName} entities`, { filters, data, error });
      throw error;
    }
  }

  /**
   * Soft delete entity (if model supports it)
   */
  async softDelete(id: string): Promise<void> {
    try {
      await this.getModel().update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      
      logger.info(`${this.modelName} soft deleted`, { id });
    } catch (error) {
      logger.error(`Failed to soft delete ${this.modelName}`, { id, error });
      throw error;
    }
  }

  /**
   * Restore soft deleted entity
   */
  async restore(id: string): Promise<T> {
    try {
      const entity = await this.getModel().update({
        where: { id },
        data: { deletedAt: null },
        ...this.getDefaultInclude(),
      });
      
      logger.info(`${this.modelName} restored`, { id });
      return this.transformToDto(entity);
    } catch (error) {
      logger.error(`Failed to restore ${this.modelName}`, { id, error });
      throw error;
    }
  }

  /**
   * Build where clause for queries (to be overridden by subclasses)
   */
  protected buildWhereClause(filters: any): any {
    return filters;
  }

  /**
   * Get default include relations (to be overridden by subclasses)
   */
  protected getDefaultInclude(): any {
    return {};
  }

  /**
   * Get default ordering (to be overridden by subclasses)
   */
  protected getDefaultOrder(): any {
    return {
      orderBy: { createdAt: 'desc' },
    };
  }

  /**
   * Execute transaction
   */
  async transaction<R>(callback: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return await this.db.$transaction(callback);
  }

  /**
   * Execute raw query
   */
  async raw<R = any>(query: string, params?: any[]): Promise<R> {
    try {
      return await this.db.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      logger.error(`Raw query failed for ${this.modelName}`, { query, params, error });
      throw error;
    }
  }
}

/**
 * Repository error types
 */
export class RepositoryError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends RepositoryError {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} '${value}' already exists`);
    this.name = 'DuplicateError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}