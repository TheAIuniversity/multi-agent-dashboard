import { TaskStatus, TaskPriority, UserRole, ProjectStatus, NotificationType } from '@prisma/client';

// Base API Response Types
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
  };
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Authentication Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Task Types
export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignee?: UserProfile;
  creator?: UserProfile;
  project?: ProjectDto;
  comments?: TaskCommentDto[];
  attachments?: TaskAttachmentDto[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: Date;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  completedThisWeek: number;
}

// Project Types
export interface ProjectDto {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: UserProfile;
  organization?: OrganizationDto;
  members?: ProjectMemberDto[];
  tasks?: TaskDto[];
  _count?: {
    members: number;
    tasks: number;
  };
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  organizationId?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ProjectMemberDto {
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
  user?: UserProfile;
  project?: ProjectDto;
}

export interface AddProjectMemberDto {
  userId: string;
  role?: UserRole;
}

// Organization Types
export interface OrganizationDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: UserProfile;
  teams?: TeamDto[];
  projects?: ProjectDto[];
  _count?: {
    teams: number;
    projects: number;
  };
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
}

// Team Types
export interface TeamDto {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: OrganizationDto;
  members?: TeamMemberDto[];
  _count?: {
    members: number;
  };
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  organizationId: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface TeamMemberDto {
  teamId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
  user?: UserProfile;
  team?: TeamDto;
}

export interface AddTeamMemberDto {
  userId: string;
  role?: UserRole;
}

// Comment Types
export interface TaskCommentDto {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
  task?: TaskDto;
}

export interface CreateCommentDto {
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

// Attachment Types
export interface TaskAttachmentDto {
  id: string;
  taskId: string;
  filename: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  createdAt: Date;
  uploader?: UserProfile;
  task?: TaskDto;
}

// Activity Types
export interface ActivityDto {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: Date;
  user?: UserProfile;
}

// Notification Types
export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
  user?: UserProfile;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export interface UpdateNotificationDto {
  read?: boolean;
}

// Search Types
export interface SearchFilters {
  query?: string;
  type?: 'tasks' | 'projects' | 'users';
  projectId?: string;
  limit?: number;
}

export interface SearchResults {
  tasks: TaskDto[];
  projects: ProjectDto[];
  users: UserProfile[];
}

// Analytics Types
export interface AnalyticsFilters {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
}

export interface TaskAnalytics {
  taskCount: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  productivity: {
    averageCompletionTime: number;
    tasksCompletedThisWeek: number;
    overdueTasks: number;
  };
  trends: {
    date: string;
    created: number;
    completed: number;
  }[];
}

// Error Types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}