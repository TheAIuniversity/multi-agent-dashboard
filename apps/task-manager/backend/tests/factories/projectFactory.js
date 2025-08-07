const { faker } = require('@faker-js/faker');

class ProjectFactory {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Generate project data without saving to database
   */
  build(overrides = {}) {
    const projectData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['active', 'archived', 'paused']),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return projectData;
  }

  /**
   * Create project in database
   */
  async create(overrides = {}) {
    // Ensure required relations exist
    if (!overrides.organizationId) {
      throw new Error('organizationId is required for project creation');
    }
    if (!overrides.createdBy) {
      throw new Error('createdBy is required for project creation');
    }

    const projectData = this.build(overrides);
    
    return await this.prisma.project.create({
      data: projectData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            ownerId: true
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
            tasks: true
          }
        }
      }
    });
  }

  /**
   * Create multiple projects
   */
  async createMany(count = 3, baseOverrides = {}) {
    const projects = [];
    for (let i = 0; i < count; i++) {
      const project = await this.create({
        ...baseOverrides,
        name: `Project ${i + 1}: ${faker.commerce.productName()}`
      });
      projects.push(project);
    }
    return projects;
  }

  /**
   * Create project with specific status
   */
  async createWithStatus(status, overrides = {}) {
    return await this.create({
      status,
      ...overrides
    });
  }

  /**
   * Create project with tasks
   */
  async createWithTasks(taskCount = 5, overrides = {}) {
    const project = await this.create(overrides);
    
    const TaskFactory = require('./taskFactory');
    const taskFactory = new TaskFactory(this.prisma);
    
    const tasks = await taskFactory.createMany(taskCount, {
      projectId: project.id,
      createdBy: project.createdBy
    });

    return { ...project, tasks };
  }

  /**
   * Create project with team members
   */
  async createWithTeam(memberCount = 3, overrides = {}) {
    const project = await this.create(overrides);
    
    // Get the organization's team
    const team = await this.prisma.team.findFirst({
      where: { organizationId: project.organizationId }
    });

    if (!team) {
      throw new Error('No team found for organization');
    }

    const UserFactory = require('./userFactory');
    const userFactory = new UserFactory(this.prisma);
    
    // Create additional team members
    const members = [];
    for (let i = 0; i < memberCount; i++) {
      const user = await userFactory.create({
        email: `member${i}+${Date.now()}@example.com`
      });
      
      await this.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: i === 0 ? 'admin' : 'member',
          joinedAt: new Date()
        }
      });
      
      members.push(user);
    }

    return { ...project, team, members };
  }

  /**
   * Create complete project with tasks, team, and activities
   */
  async createComplete(overrides = {}) {
    // Create project with team
    const { project, team, members } = await this.createWithTeam(3, overrides);
    
    const TaskFactory = require('./taskFactory');
    const taskFactory = new TaskFactory(this.prisma);
    
    // Create tasks assigned to different team members
    const tasks = [];
    for (let i = 0; i < 8; i++) {
      const assignee = faker.helpers.arrayElement([project.createdBy, ...members.map(m => m.id)]);
      const task = await taskFactory.create({
        projectId: project.id,
        createdBy: project.createdBy,
        assigneeId: assignee,
        status: faker.helpers.arrayElement(['todo', 'in_progress', 'done']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high'])
      });
      tasks.push(task);
    }

    // Create project activities
    const activities = [];
    for (let i = 0; i < 5; i++) {
      const activity = await this.prisma.activity.create({
        data: {
          id: faker.string.uuid(),
          userId: faker.helpers.arrayElement([project.createdBy, ...members.map(m => m.id)]),
          action: faker.helpers.arrayElement(['project_updated', 'task_created', 'task_completed', 'comment_added']),
          entityType: 'project',
          entityId: project.id,
          metadata: JSON.stringify({
            projectId: project.id,
            action: 'test_activity'
          }),
          createdAt: faker.date.recent({ days: 7 })
        }
      });
      activities.push(activity);
    }

    return { ...project, team, members, tasks, activities };
  }

  /**
   * Create project workspace for testing collaboration features
   */
  async createWorkspace(overrides = {}) {
    const { project, team, members } = await this.createWithTeam(5, overrides);
    
    const TaskFactory = require('./taskFactory');
    const taskFactory = new TaskFactory(this.prisma);
    
    // Create a full kanban board
    const kanbanBoard = await taskFactory.createKanbanBoard(project.id, project.createdBy);
    
    // Create notifications for team members
    const notifications = [];
    for (const member of members) {
      const notification = await this.prisma.notification.create({
        data: {
          id: faker.string.uuid(),
          userId: member.id,
          type: 'project_invitation',
          title: 'Project Invitation',
          message: `You have been added to ${project.name}`,
          read: faker.datatype.boolean(),
          createdAt: new Date()
        }
      });
      notifications.push(notification);
    }

    return {
      project,
      team,
      members,
      tasks: kanbanBoard,
      notifications
    };
  }
}

module.exports = ProjectFactory;