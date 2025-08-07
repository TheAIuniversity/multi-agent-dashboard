const TaskService = require('../../../src/services/taskService');
const TaskRepository = require('../../../src/repositories/taskRepository');
const ProjectRepository = require('../../../src/repositories/projectRepository');
const NotificationService = require('../../../src/services/notificationService');
const ActivityService = require('../../../src/services/activityService');
const { FactoryManager } = require('../../factories');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../../src/utils/errors');

// Mock dependencies
jest.mock('../../../src/repositories/taskRepository');
jest.mock('../../../src/repositories/projectRepository');
jest.mock('../../../src/services/notificationService');
jest.mock('../../../src/services/activityService');

describe('TaskService', () => {
  let taskService;
  let mockTaskRepository;
  let mockProjectRepository;
  let mockNotificationService;
  let mockActivityService;
  let factory;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockTaskRepository = new TaskRepository();
    mockProjectRepository = new ProjectRepository();
    mockNotificationService = new NotificationService();
    mockActivityService = new ActivityService();

    // Create service instance
    taskService = new TaskService(
      mockTaskRepository,
      mockProjectRepository,
      mockNotificationService,
      mockActivityService
    );

    // Create factory for test data
    factory = new FactoryManager(global.testUtils.prisma);
  });

  describe('createTask', () => {
    let mockProject, mockUser, createTaskDto;

    beforeEach(() => {
      mockProject = factory.project.build({
        id: 'project-123',
        name: 'Test Project',
        organizationId: 'org-123'
      });

      mockUser = factory.user.build({
        id: 'user-123',
        email: 'test@example.com'
      });

      createTaskDto = {
        title: 'Test Task',
        description: 'Test task description',
        priority: 'medium',
        projectId: 'project-123',
        assigneeId: 'assignee-123',
        dueDate: new Date(Date.now() + 86400000) // Tomorrow
      };
    });

    it('should create task successfully when user has permission', async () => {
      const expectedTask = factory.task.build({
        id: 'task-123',
        ...createTaskDto,
        createdBy: mockUser.id,
        status: 'todo'
      });

      // Mock repository calls
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockTaskRepository.create.mockResolvedValue(expectedTask);
      
      // Mock permission check (assuming this method exists)
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(true);

      const result = await taskService.createTask(createTaskDto, mockUser.id);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project-123');
      expect(taskService.checkProjectPermission).toHaveBeenCalledWith(mockUser.id, 'project-123', 'member');
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        createdBy: mockUser.id
      });
      expect(mockActivityService.logActivity).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'task_created',
        entityType: 'task',
        entityId: expectedTask.id,
        metadata: { projectId: mockProject.id }
      });
      expect(result).toEqual(expectedTask);
    });

    it('should send notification to assignee when task is assigned to different user', async () => {
      const expectedTask = factory.task.build({
        id: 'task-123',
        ...createTaskDto,
        createdBy: mockUser.id
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockTaskRepository.create.mockResolvedValue(expectedTask);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(true);

      await taskService.createTask(createTaskDto, mockUser.id);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        userId: 'assignee-123',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${createTaskDto.title}`,
        entityType: 'task',
        entityId: expectedTask.id
      });
    });

    it('should not send notification when user assigns task to themselves', async () => {
      const selfAssignedDto = {
        ...createTaskDto,
        assigneeId: mockUser.id
      };

      const expectedTask = factory.task.build({
        id: 'task-123',
        ...selfAssignedDto,
        createdBy: mockUser.id
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockTaskRepository.create.mockResolvedValue(expectedTask);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(true);

      await taskService.createTask(selfAssignedDto, mockUser.id);

      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockProjectRepository.findById.mockResolvedValue(null);

      await expect(taskService.createTask(createTaskDto, mockUser.id))
        .rejects.toThrow(NotFoundError);
      
      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project-123');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(false);

      await expect(taskService.createTask(createTaskDto, mockUser.id))
        .rejects.toThrow(ForbiddenError);

      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        description: 'Missing title',
        projectId: 'project-123'
      };

      await expect(taskService.createTask(invalidDto, mockUser.id))
        .rejects.toThrow(ValidationError);
    });

    it('should validate due date is in the future', async () => {
      const pastDueDto = {
        ...createTaskDto,
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      };

      await expect(taskService.createTask(pastDueDto, mockUser.id))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('updateTask', () => {
    let mockTask, mockUser, updateTaskDto;

    beforeEach(() => {
      mockTask = factory.task.build({
        id: 'task-123',
        title: 'Original Task',
        status: 'todo',
        projectId: 'project-123',
        createdBy: 'creator-123',
        assigneeId: 'assignee-123'
      });

      mockUser = factory.user.build({
        id: 'user-123',
        email: 'test@example.com'
      });

      updateTaskDto = {
        title: 'Updated Task',
        status: 'in_progress',
        priority: 'high'
      };
    });

    it('should update task successfully when user has permission', async () => {
      const updatedTask = { ...mockTask, ...updateTaskDto, updatedAt: new Date() };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      const result = await taskService.updateTask('task-123', updateTaskDto, mockUser.id);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(taskService.checkTaskPermission).toHaveBeenCalledWith(mockUser.id, mockTask, 'update');
      expect(mockTaskRepository.update).toHaveBeenCalledWith('task-123', updateTaskDto);
      expect(mockActivityService.logActivity).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'task_updated',
        entityType: 'task',
        entityId: 'task-123',
        metadata: {
          projectId: mockTask.projectId,
          changes: updateTaskDto
        }
      });
      expect(result).toEqual(updatedTask);
    });

    it('should send notification when task status changes to done', async () => {
      const completionDto = { status: 'done' };
      const completedTask = { ...mockTask, status: 'done' };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(completedTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      await taskService.updateTask('task-123', completionDto, mockUser.id);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        userId: mockTask.assigneeId,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${mockTask.title}" has been marked as complete`,
        entityType: 'task',
        entityId: mockTask.id
      });
    });

    it('should send notification when assignee changes', async () => {
      const reassignDto = { assigneeId: 'new-assignee-123' };
      const reassignedTask = { ...mockTask, assigneeId: 'new-assignee-123' };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(reassignedTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      await taskService.updateTask('task-123', reassignDto, mockUser.id);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        userId: 'new-assignee-123',
        type: 'task_assigned',
        title: 'Task Reassigned',
        message: `You have been assigned to: ${mockTask.title}`,
        entityType: 'task',
        entityId: mockTask.id
      });
    });

    it('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.updateTask('nonexistent-task', updateTaskDto, mockUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(false);

      await expect(taskService.updateTask('task-123', updateTaskDto, mockUser.id))
        .rejects.toThrow(ForbiddenError);

      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    let mockTask, mockUser;

    beforeEach(() => {
      mockTask = factory.task.build({
        id: 'task-123',
        title: 'Task to Delete',
        projectId: 'project-123',
        createdBy: 'creator-123'
      });

      mockUser = factory.user.build({
        id: 'user-123',
        email: 'test@example.com'
      });
    });

    it('should delete task successfully when user has permission', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      await taskService.deleteTask('task-123', mockUser.id);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(taskService.checkTaskPermission).toHaveBeenCalledWith(mockUser.id, mockTask, 'delete');
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('task-123');
      expect(mockActivityService.logActivity).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'task_deleted',
        entityType: 'task',
        entityId: 'task-123',
        metadata: {
          projectId: mockTask.projectId,
          title: mockTask.title
        }
      });
    });

    it('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.deleteTask('nonexistent-task', mockUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(false);

      await expect(taskService.deleteTask('task-123', mockUser.id))
        .rejects.toThrow(ForbiddenError);

      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getTasksByProject', () => {
    let mockProject, mockUser, mockTasks;

    beforeEach(() => {
      mockProject = factory.project.build({
        id: 'project-123',
        organizationId: 'org-123'
      });

      mockUser = factory.user.build({
        id: 'user-123'
      });

      mockTasks = [
        factory.task.build({ id: 'task-1', projectId: 'project-123', status: 'todo' }),
        factory.task.build({ id: 'task-2', projectId: 'project-123', status: 'in_progress' }),
        factory.task.build({ id: 'task-3', projectId: 'project-123', status: 'done' })
      ];
    });

    it('should return filtered tasks when user has permission', async () => {
      const filters = { status: 'todo', priority: 'high' };

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockTaskRepository.findByProject.mockResolvedValue([mockTasks[0]]);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(true);

      const result = await taskService.getTasksByProject('project-123', filters, mockUser.id);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith('project-123');
      expect(taskService.checkProjectPermission).toHaveBeenCalledWith(mockUser.id, 'project-123', 'read');
      expect(mockTaskRepository.findByProject).toHaveBeenCalledWith('project-123', filters);
      expect(result).toEqual([mockTasks[0]]);
    });

    it('should return all tasks when no filters provided', async () => {
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockTaskRepository.findByProject.mockResolvedValue(mockTasks);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(true);

      const result = await taskService.getTasksByProject('project-123', {}, mockUser.id);

      expect(mockTaskRepository.findByProject).toHaveBeenCalledWith('project-123', {});
      expect(result).toEqual(mockTasks);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockProjectRepository.findById.mockResolvedValue(null);

      await expect(taskService.getTasksByProject('nonexistent-project', {}, mockUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      jest.spyOn(taskService, 'checkProjectPermission').mockResolvedValue(false);

      await expect(taskService.getTasksByProject('project-123', {}, mockUser.id))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe('assignTask', () => {
    let mockTask, mockUser, mockAssignee;

    beforeEach(() => {
      mockTask = factory.task.build({
        id: 'task-123',
        title: 'Task to Assign',
        projectId: 'project-123',
        assigneeId: null
      });

      mockUser = factory.user.build({
        id: 'user-123'
      });

      mockAssignee = factory.user.build({
        id: 'assignee-123',
        email: 'assignee@example.com'
      });
    });

    it('should assign task successfully when user has permission', async () => {
      const assignedTask = { ...mockTask, assigneeId: mockAssignee.id };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(assignedTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      const result = await taskService.assignTask('task-123', mockAssignee.id, mockUser.id);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(taskService.checkTaskPermission).toHaveBeenCalledWith(mockUser.id, mockTask, 'update');
      expect(mockTaskRepository.update).toHaveBeenCalledWith('task-123', { assigneeId: mockAssignee.id });
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        userId: mockAssignee.id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned to: ${mockTask.title}`,
        entityType: 'task',
        entityId: mockTask.id
      });
      expect(result).toEqual(assignedTask);
    });

    it('should handle unassigning task (assigneeId = null)', async () => {
      const taskWithAssignee = { ...mockTask, assigneeId: 'old-assignee-123' };
      const unassignedTask = { ...taskWithAssignee, assigneeId: null };

      mockTaskRepository.findById.mockResolvedValue(taskWithAssignee);
      mockTaskRepository.update.mockResolvedValue(unassignedTask);
      jest.spyOn(taskService, 'checkTaskPermission').mockResolvedValue(true);

      const result = await taskService.assignTask('task-123', null, mockUser.id);

      expect(mockTaskRepository.update).toHaveBeenCalledWith('task-123', { assigneeId: null });
      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
      expect(result).toEqual(unassignedTask);
    });
  });
});