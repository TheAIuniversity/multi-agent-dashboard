const { faker } = require('@faker-js/faker');

class TaskFactory {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Generate task data without saving to database
   */
  build(overrides = {}) {
    const taskData = {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(4),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['todo', 'in_progress', 'done']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      dueDate: faker.date.future(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return taskData;
  }

  /**
   * Create task in database
   */
  async create(overrides = {}) {
    // Ensure required relations exist
    if (!overrides.projectId) {
      throw new Error('projectId is required for task creation');
    }
    if (!overrides.createdBy) {
      throw new Error('createdBy is required for task creation');
    }

    const taskData = this.build(overrides);
    
    return await this.prisma.task.create({
      data: taskData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true
          }
        }
      }
    });
  }

  /**
   * Create multiple tasks
   */
  async createMany(count = 5, baseOverrides = {}) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      const task = await this.create({
        ...baseOverrides,
        title: `Task ${i + 1}: ${faker.lorem.sentence(3)}`
      });
      tasks.push(task);
    }
    return tasks;
  }

  /**
   * Create task with specific status
   */
  async createWithStatus(status, overrides = {}) {
    return await this.create({
      status,
      ...overrides
    });
  }

  /**
   * Create task with high priority
   */
  async createHighPriority(overrides = {}) {
    return await this.create({
      priority: 'urgent',
      title: `URGENT: ${faker.lorem.sentence(3)}`,
      dueDate: faker.date.soon({ days: 3 }),
      ...overrides
    });
  }

  /**
   * Create overdue task
   */
  async createOverdue(overrides = {}) {
    return await this.create({
      status: 'todo',
      priority: 'high',
      dueDate: faker.date.past(),
      title: `Overdue: ${faker.lorem.sentence(3)}`,
      ...overrides
    });
  }

  /**
   * Create task with comments
   */
  async createWithComments(commentCount = 3, overrides = {}) {
    const task = await this.create(overrides);
    
    const comments = [];
    for (let i = 0; i < commentCount; i++) {
      const comment = await this.prisma.taskComment.create({
        data: {
          id: faker.string.uuid(),
          taskId: task.id,
          userId: task.createdBy,
          content: faker.lorem.paragraph(),
          createdAt: new Date(Date.now() - (commentCount - i) * 60000), // Spread comments over time
          updatedAt: new Date(Date.now() - (commentCount - i) * 60000)
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        }
      });
      comments.push(comment);
    }

    return { ...task, comments };
  }

  /**
   * Create task with attachments
   */
  async createWithAttachments(attachmentCount = 2, overrides = {}) {
    const task = await this.create(overrides);
    
    const attachments = [];
    for (let i = 0; i < attachmentCount; i++) {
      const attachment = await this.prisma.taskAttachment.create({
        data: {
          id: faker.string.uuid(),
          taskId: task.id,
          filename: faker.system.fileName(),
          fileUrl: faker.internet.url(),
          uploadedBy: task.createdBy,
          createdAt: new Date()
        }
      });
      attachments.push(attachment);
    }

    return { ...task, attachments };
  }

  /**
   * Create task with full relations (comments, attachments, activities)
   */
  async createComplete(overrides = {}) {
    const task = await this.create(overrides);
    
    // Add comments
    const comments = [];
    for (let i = 0; i < 3; i++) {
      const comment = await this.prisma.taskComment.create({
        data: {
          id: faker.string.uuid(),
          taskId: task.id,
          userId: task.createdBy,
          content: faker.lorem.paragraph(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      comments.push(comment);
    }

    // Add attachments
    const attachments = [];
    for (let i = 0; i < 2; i++) {
      const attachment = await this.prisma.taskAttachment.create({
        data: {
          id: faker.string.uuid(),
          taskId: task.id,
          filename: faker.system.fileName(),
          fileUrl: faker.internet.url(),
          uploadedBy: task.createdBy,
          createdAt: new Date()
        }
      });
      attachments.push(attachment);
    }

    // Add activity log
    await this.prisma.activity.create({
      data: {
        id: faker.string.uuid(),
        userId: task.createdBy,
        action: 'task_created',
        entityType: 'task',
        entityId: task.id,
        metadata: JSON.stringify({
          projectId: task.projectId,
          title: task.title
        }),
        createdAt: new Date()
      }
    });

    return { ...task, comments, attachments };
  }

  /**
   * Create kanban board setup with tasks in different columns
   */
  async createKanbanBoard(projectId, createdBy) {
    const todoTasks = await this.createMany(3, {
      projectId,
      createdBy,
      status: 'todo',
      priority: 'medium'
    });

    const inProgressTasks = await this.createMany(2, {
      projectId,
      createdBy,
      status: 'in_progress',
      priority: 'high'
    });

    const doneTasks = await this.createMany(4, {
      projectId,
      createdBy,
      status: 'done',
      priority: 'low'
    });

    return {
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
      all: [...todoTasks, ...inProgressTasks, ...doneTasks]
    };
  }
}

module.exports = TaskFactory;