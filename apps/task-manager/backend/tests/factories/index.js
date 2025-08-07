const UserFactory = require('./userFactory');
const ProjectFactory = require('./projectFactory');
const TaskFactory = require('./taskFactory');

/**
 * Factory manager for creating test data
 */
class FactoryManager {
  constructor(prisma) {
    this.prisma = prisma;
    this.user = new UserFactory(prisma);
    this.project = new ProjectFactory(prisma);
    this.task = new TaskFactory(prisma);
  }

  /**
   * Create a complete test scenario with user, organization, project, and tasks
   */
  async createScenario(scenarioType = 'basic') {
    switch (scenarioType) {
      case 'basic':
        return await this.createBasicScenario();
      case 'team':
        return await this.createTeamScenario();
      case 'enterprise':
        return await this.createEnterpriseScenario();
      default:
        throw new Error(`Unknown scenario type: ${scenarioType}`);
    }
  }

  /**
   * Basic scenario: Single user with project and tasks
   */
  async createBasicScenario() {
    const { user, organization } = await this.user.createWithOrganization();
    const project = await this.project.create({
      organizationId: organization.id,
      createdBy: user.id
    });
    const tasks = await this.task.createMany(5, {
      projectId: project.id,
      createdBy: user.id,
      assigneeId: user.id
    });

    return { user, organization, project, tasks };
  }

  /**
   * Team scenario: Multiple users working on shared projects
   */
  async createTeamScenario() {
    const { user: owner, organization, team } = await this.user.createWithTeam();
    
    // Create team members
    const members = await this.user.createMany(3);
    for (const member of members) {
      await this.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: member.id,
          role: 'member',
          joinedAt: new Date()
        }
      });
    }

    // Create shared project
    const project = await this.project.create({
      organizationId: organization.id,
      createdBy: owner.id
    });

    // Create tasks for different team members
    const tasks = [];
    const allUsers = [owner, ...members];
    for (let i = 0; i < 10; i++) {
      const creator = allUsers[i % allUsers.length];
      const assignee = allUsers[(i + 1) % allUsers.length];
      
      const task = await this.task.create({
        projectId: project.id,
        createdBy: creator.id,
        assigneeId: assignee.id
      });
      tasks.push(task);
    }

    return { owner, members, organization, team, project, tasks };
  }

  /**
   * Enterprise scenario: Multiple organizations, teams, and projects
   */
  async createEnterpriseScenario() {
    const scenarios = [];
    
    // Create 3 organizations
    for (let i = 0; i < 3; i++) {
      const { user: owner, organization, team } = await this.user.createWithTeam();
      
      // Create multiple projects per organization
      const projects = await this.project.createMany(2, {
        organizationId: organization.id,
        createdBy: owner.id
      });

      // Create tasks for each project
      const allProjectTasks = [];
      for (const project of projects) {
        const tasks = await this.task.createMany(8, {
          projectId: project.id,
          createdBy: owner.id,
          assigneeId: owner.id
        });
        allProjectTasks.push(...tasks);
      }

      scenarios.push({
        owner,
        organization,
        team,
        projects,
        tasks: allProjectTasks
      });
    }

    return scenarios;
  }

  /**
   * Create test data for real-time features
   */
  async createRealtimeScenario() {
    const { owner, members, organization, team, project } = await this.createTeamScenario();
    
    // Create active tasks for real-time testing
    const activeTasks = [];
    for (let i = 0; i < 5; i++) {
      const task = await this.task.createWithComments(3, {
        projectId: project.id,
        createdBy: owner.id,
        assigneeId: members[i % members.length].id,
        status: 'in_progress'
      });
      activeTasks.push(task);
    }

    return {
      owner,
      members,
      organization,
      team,
      project,
      activeTasks
    };
  }

  /**
   * Create test data for performance testing
   */
  async createPerformanceScenario(scale = 'medium') {
    const scales = {
      small: { users: 10, projects: 5, tasksPerProject: 20 },
      medium: { users: 50, projects: 20, tasksPerProject: 50 },
      large: { users: 100, projects: 50, tasksPerProject: 100 }
    };

    const config = scales[scale] || scales.medium;
    
    // Create organization with owner
    const { user: owner, organization } = await this.user.createWithOrganization();
    
    // Create users
    const users = [owner, ...await this.user.createMany(config.users - 1)];
    
    // Create projects
    const projects = await this.project.createMany(config.projects, {
      organizationId: organization.id,
      createdBy: owner.id
    });

    // Create tasks for each project
    const allTasks = [];
    for (const project of projects) {
      const tasks = await this.task.createMany(config.tasksPerProject, {
        projectId: project.id,
        createdBy: owner.id,
        assigneeId: users[Math.floor(Math.random() * users.length)].id
      });
      allTasks.push(...tasks);
    }

    return {
      organization,
      users,
      projects,
      tasks: allTasks,
      stats: {
        userCount: users.length,
        projectCount: projects.length,
        taskCount: allTasks.length
      }
    };
  }

  /**
   * Clean up all test data
   */
  async cleanup() {
    await global.cleanupDatabase();
  }
}

module.exports = {
  UserFactory,
  ProjectFactory,
  TaskFactory,
  FactoryManager
};