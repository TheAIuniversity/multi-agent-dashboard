const request = require('supertest');
const app = require('../../src/app');
const { FactoryManager } = require('../factories');

describe('Authorization Security Tests', () => {
  let factory;

  beforeEach(() => {
    factory = new FactoryManager(global.testUtils.prisma);
  });

  describe('Project Access Control', () => {
    let ownerUser, memberUser, outsiderUser;
    let ownerToken, memberToken, outsiderToken;
    let organization, team, project;

    beforeEach(async () => {
      // Create organization owner
      const ownerData = await factory.user.createWithToken({
        email: 'owner@example.com',
        name: 'Project Owner'
      });
      ownerUser = ownerData.user;
      ownerToken = ownerData.token;

      // Create organization and project
      organization = await global.testUtils.prisma.organization.create({
        data: {
          id: global.testUtils.generateTestUser().id,
          name: 'Test Organization',
          description: 'Test organization for authorization',
          ownerId: ownerUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      team = await global.testUtils.prisma.team.create({
        data: {
          id: global.testUtils.generateTestUser().id,
          organizationId: organization.id,
          name: 'Test Team',
          description: 'Test team',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      project = await factory.project.create({
        organizationId: organization.id,
        createdBy: ownerUser.id,
        name: 'Secure Project'
      });

      // Create team member
      const memberData = await factory.user.createWithToken({
        email: 'member@example.com',
        name: 'Team Member'
      });
      memberUser = memberData.user;
      memberToken = memberData.token;

      await global.testUtils.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: memberUser.id,
          role: 'member',
          joinedAt: new Date()
        }
      });

      // Create outsider user (not in organization)
      const outsiderData = await factory.user.createWithToken({
        email: 'outsider@example.com',
        name: 'Outsider User'
      });
      outsiderUser = outsiderData.user;
      outsiderToken = outsiderData.token;
    });

    describe('Project Access', () => {
      it('should allow project owner to access project', async () => {
        const response = await request(app)
          .get(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(project.id);
      });

      it('should allow team member to access project', async () => {
        const response = await request(app)
          .get(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(project.id);
      });

      it('should deny outsider access to project', async () => {
        const response = await request(app)
          .get(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${outsiderToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('should deny unauthenticated access to project', async () => {
        const response = await request(app)
          .get(`/api/projects/${project.id}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Project Modification', () => {
      it('should allow owner to update project', async () => {
        const updateData = {
          name: 'Updated Project Name',
          description: 'Updated description'
        };

        const response = await request(app)
          .put(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
      });

      it('should deny member from updating project settings', async () => {
        const updateData = {
          name: 'Unauthorized Update',
          description: 'Should not work'
        };

        const response = await request(app)
          .put(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });

      it('should deny outsider from updating project', async () => {
        const updateData = {
          name: 'Malicious Update'
        };

        const response = await request(app)
          .put(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${outsiderToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });

    describe('Project Deletion', () => {
      it('should allow owner to delete project', async () => {
        const response = await request(app)
          .delete(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(204);

        // Verify project is deleted
        const deletedProject = await global.testUtils.prisma.project.findUnique({
          where: { id: project.id }
        });
        expect(deletedProject).toBeNull();
      });

      it('should deny member from deleting project', async () => {
        const response = await request(app)
          .delete(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${memberToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });

      it('should deny outsider from deleting project', async () => {
        const response = await request(app)
          .delete(`/api/projects/${project.id}`)
          .set('Authorization', `Bearer ${outsiderToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });

  describe('Task Access Control', () => {
    let projectOwner, assignee, outsider;
    let ownerToken, assigneeToken, outsiderToken;
    let project, task;

    beforeEach(async () => {
      // Create basic scenario with project and tasks
      const scenario = await factory.createScenario('team');
      projectOwner = scenario.owner;
      assignee = scenario.members[0];
      outsider = scenario.members[1]; // Use second member as outsider
      project = scenario.project;

      // Create tokens
      const ownerData = await factory.user.createWithToken({ id: projectOwner.id });
      const assigneeData = await factory.user.createWithToken({ id: assignee.id });
      const outsiderData = await factory.user.createWithToken({ id: outsider.id });

      ownerToken = ownerData.token;
      assigneeToken = assigneeData.token;
      outsiderToken = outsiderData.token;

      // Create a task assigned to specific user
      task = await factory.task.create({
        projectId: project.id,
        createdBy: projectOwner.id,
        assigneeId: assignee.id,
        title: 'Test Task for Authorization'
      });

      // Remove outsider from team to make them truly external
      await global.testUtils.prisma.teamMember.deleteMany({
        where: {
          userId: outsider.id
        }
      });
    });

    describe('Task Viewing', () => {
      it('should allow project owner to view any task', async () => {
        const response = await request(app)
          .get(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(task.id);
      });

      it('should allow assignee to view their assigned task', async () => {
        const response = await request(app)
          .get(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${assigneeToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(task.id);
      });

      it('should deny outsider access to task', async () => {
        const response = await request(app)
          .get(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${outsiderToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });

    describe('Task Modification', () => {
      it('should allow assignee to update their task status', async () => {
        const updateData = { status: 'in_progress' };

        const response = await request(app)
          .put(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${assigneeToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('in_progress');
      });

      it('should allow project owner to update any task', async () => {
        const updateData = {
          title: 'Updated by Owner',
          priority: 'high'
        };

        const response = await request(app)
          .put(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updateData.title);
      });

      it('should deny outsider from modifying task', async () => {
        const updateData = { title: 'Unauthorized Update' };

        const response = await request(app)
          .put(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${outsiderToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });

    describe('Task Creation', () => {
      it('should allow team member to create task in project', async () => {
        const taskData = {
          title: 'New Task by Member',
          description: 'Created by team member',
          projectId: project.id,
          priority: 'medium'
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${assigneeToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(taskData.title);
      });

      it('should deny outsider from creating task in project', async () => {
        const taskData = {
          title: 'Unauthorized Task',
          projectId: project.id
        };

        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${outsiderToken}`)
          .send(taskData)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });

  describe('Cross-User Data Access', () => {
    let user1, user2, user1Token, user2Token;
    let user1Project, user1Task;

    beforeEach(async () => {
      // Create two separate users with their own data
      const userData1 = await factory.user.createWithToken({
        email: 'user1@example.com'
      });
      const userData2 = await factory.user.createWithToken({
        email: 'user2@example.com'
      });

      user1 = userData1.user;
      user2 = userData2.user;
      user1Token = userData1.token;
      user2Token = userData2.token;

      // Create organization and project for user1
      const { user, organization } = await factory.user.createWithOrganization({}, { id: user1.id });
      user1Project = await factory.project.create({
        organizationId: organization.id,
        createdBy: user1.id
      });

      user1Task = await factory.task.create({
        projectId: user1Project.id,
        createdBy: user1.id,
        assigneeId: user1.id
      });
    });

    it('should prevent user from accessing another users private data', async () => {
      // User2 trying to access User1's project
      const response = await request(app)
        .get(`/api/projects/${user1Project.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should prevent user from modifying another users data', async () => {
      // User2 trying to update User1's task
      const response = await request(app)
        .put(`/api/tasks/${user1Task.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Malicious Update' })
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should prevent privilege escalation through parameter manipulation', async () => {
      // User2 trying to add themselves to User1's organization
      const response = await request(app)
        .post(`/api/organizations/${user1Project.organizationId}/members`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          userId: user2.id,
          role: 'admin'
        })
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Role-Based Access Control', () => {
    let owner, admin, member, viewer;
    let ownerToken, adminToken, memberToken, viewerToken;
    let organization, team, project;

    beforeEach(async () => {
      // Create users with different roles
      const ownerData = await factory.user.createWithToken({ email: 'owner@example.com' });
      const adminData = await factory.user.createWithToken({ email: 'admin@example.com' });
      const memberData = await factory.user.createWithToken({ email: 'member@example.com' });
      const viewerData = await factory.user.createWithToken({ email: 'viewer@example.com' });

      owner = ownerData.user;
      admin = adminData.user;
      member = memberData.user;
      viewer = viewerData.user;

      ownerToken = ownerData.token;
      adminToken = adminData.token;
      memberToken = memberData.token;
      viewerToken = viewerData.token;

      // Create organization
      organization = await global.testUtils.prisma.organization.create({
        data: {
          id: global.testUtils.generateTestUser().id,
          name: 'RBAC Test Org',
          ownerId: owner.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      team = await global.testUtils.prisma.team.create({
        data: {
          id: global.testUtils.generateTestUser().id,
          organizationId: organization.id,
          name: 'RBAC Test Team',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Add users to team with different roles
      await global.testUtils.prisma.teamMember.createMany({
        data: [
          { teamId: team.id, userId: admin.id, role: 'admin', joinedAt: new Date() },
          { teamId: team.id, userId: member.id, role: 'member', joinedAt: new Date() },
          { teamId: team.id, userId: viewer.id, role: 'viewer', joinedAt: new Date() }
        ]
      });

      project = await factory.project.create({
        organizationId: organization.id,
        createdBy: owner.id
      });
    });

    it('should allow owner full access to organization', async () => {
      // Owner can update organization
      const response = await request(app)
        .put(`/api/organizations/${organization.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Updated by Owner' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to manage team and projects', async () => {
      // Admin can update project
      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated by Admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow member to create and modify tasks', async () => {
      // Member can create task
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Task by Member',
          projectId: project.id
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should restrict viewer to read-only access', async () => {
      // Viewer can read project
      const readResponse = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);

      // But viewer cannot create tasks
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: 'Unauthorized Task',
          projectId: project.id
        })
        .expect(403);

      expect(createResponse.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent role escalation through direct API calls', async () => {
      // Member trying to promote themselves to admin
      const response = await request(app)
        .put(`/api/teams/${team.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});