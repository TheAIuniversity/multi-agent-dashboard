const request = require('supertest');
const app = require('../../../src/app');
const { FactoryManager } = require('../../factories');

describe('Tasks API Endpoints', () => {
  let factory, user, token, project, organization;

  beforeEach(async () => {
    factory = new FactoryManager(global.testUtils.prisma);
    
    // Create authenticated user with project
    const userData = await factory.user.createWithToken();
    user = userData.user;
    token = userData.token;

    const orgData = await factory.user.createWithOrganization({}, { id: user.id });
    organization = orgData.organization;
    
    project = await factory.project.create({
      organizationId: organization.id,
      createdBy: user.id
    });
  });

  describe('GET /api/tasks', () => {
    let tasks;

    beforeEach(async () => {
      tasks = await factory.task.createMany(5, {
        projectId: project.id,
        createdBy: user.id,
        assigneeId: user.id
      });
    });

    it('should return paginated list of tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ projectId: project.id })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tasks');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
      expect(response.body.data.tasks).toHaveLength(5);
      expect(response.body.data.total).toBe(5);
    });

    it('should filter tasks by status', async () => {
      // Create tasks with different statuses
      await factory.task.create({
        projectId: project.id,
        createdBy: user.id,
        status: 'in_progress'
      });

      const response = await request(app)
        .get('/api/tasks')
        .query({ 
          projectId: project.id,
          status: 'in_progress'
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('in_progress');
    });

    it('should filter tasks by priority', async () => {
      await factory.task.create({
        projectId: project.id,
        createdBy: user.id,
        priority: 'urgent'
      });

      const response = await request(app)
        .get('/api/tasks')
        .query({
          projectId: project.id,
          priority: 'urgent'
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('urgent');
    });

    it('should implement pagination correctly', async () => {
      // Create more tasks for pagination testing
      await factory.task.createMany(15, {
        projectId: project.id,
        createdBy: user.id
      });

      // Test first page
      const page1Response = await request(app)
        .get('/api/tasks')
        .query({
          projectId: project.id,
          page: 1,
          limit: 10
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page1Response.body.data.tasks).toHaveLength(10);
      expect(page1Response.body.data.page).toBe(1);

      // Test second page
      const page2Response = await request(app)
        .get('/api/tasks')
        .query({
          projectId: project.id,
          page: 2,
          limit: 10
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page2Response.body.data.tasks).toHaveLength(10);
      expect(page2Response.body.data.page).toBe(2);

      // Ensure different results
      const page1Ids = page1Response.body.data.tasks.map(t => t.id);
      const page2Ids = page2Response.body.data.tasks.map(t => t.id);
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it('should return empty result for invalid project', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ projectId: 'non-existent-project' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.tasks).toHaveLength(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ projectId: project.id })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id,
        assigneeId: user.id
      });
    });

    it('should return task details', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveValidTaskStructure();
      expect(response.body.data.id).toBe(task.id);
      expect(response.body.data.title).toBe(task.title);
      expect(response.body.data.status).toBe(task.status);
      expect(response.body.data.priority).toBe(task.priority);
    });

    it('should include related data', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('assignee');
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data).toHaveProperty('createdByUser');
      expect(response.body.data.assignee).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String)
      });
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create task with minimal data', async () => {
      const taskData = {
        title: 'New Test Task',
        projectId: project.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveValidTaskStructure();
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.status).toBe('todo'); // Default status
      expect(response.body.data.priority).toBe('medium'); // Default priority
      expect(response.body.data.createdBy).toBe(user.id);
    });

    it('should create task with complete data', async () => {
      const assignee = await factory.user.create();
      const dueDate = new Date(Date.now() + 86400000); // Tomorrow

      const taskData = {
        title: 'Complete Test Task',
        description: 'Detailed task description',
        priority: 'high',
        assigneeId: assignee.id,
        dueDate: dueDate.toISOString(),
        projectId: project.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.assigneeId).toBe(taskData.assigneeId);
      expect(new Date(response.body.data.dueDate)).toEqual(dueDate);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Missing title',
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: expect.stringContaining('required')
          })
        ])
      );
    });

    it('should validate field constraints', async () => {
      const taskData = {
        title: 'A'.repeat(256), // Too long
        priority: 'invalid',
        dueDate: 'not-a-date',
        projectId: project.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.length).toBeGreaterThan(1);
    });

    it('should reject past due dates', async () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Past Due Task',
          dueDate: pastDate.toISOString(),
          projectId: project.id
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Unauthorized Task',
          projectId: project.id
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id,
        assigneeId: user.id
      });
    });

    it('should update task fields', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'in_progress',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.priority).toBe(updateData.priority);
      expect(response.body.data.updatedAt).not.toBe(task.updatedAt);
    });

    it('should partially update task', async () => {
      const updateData = { status: 'done' };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe('done');
      expect(response.body.data.title).toBe(task.title); // Unchanged
    });

    it('should update assignee', async () => {
      const newAssignee = await factory.user.create();
      const updateData = { assigneeId: newAssignee.id };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.assigneeId).toBe(newAssignee.id);
    });

    it('should clear assignee when set to null', async () => {
      const updateData = { assigneeId: null };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.assigneeId).toBeNull();
    });

    it('should validate update data', async () => {
      const invalidData = {
        status: 'invalid-status',
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id,
        assigneeId: user.id
      });
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify task is deleted
      const deletedTask = await global.testUtils.prisma.task.findUnique({
        where: { id: task.id }
      });
      expect(deletedTask).toBeNull();
    });

    it('should cascade delete related data', async () => {
      // Add comments and attachments to task
      const taskWithRelations = await factory.task.createWithComments(2, {
        projectId: project.id,
        createdBy: user.id
      });

      await request(app)
        .delete(`/api/tasks/${taskWithRelations.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify related data is deleted
      const comments = await global.testUtils.prisma.taskComment.findMany({
        where: { taskId: taskWithRelations.id }
      });
      expect(comments).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalFindMany = global.testUtils.prisma.task.findMany;
      global.testUtils.prisma.task.findMany = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/tasks')
        .query({ projectId: project.id })
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');

      // Restore original method
      global.testUtils.prisma.task.findMany = originalFindMany;
    });

    it('should handle malformed request bodies', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_JSON');
    });

    it('should handle large request payloads', async () => {
      const largeDescription = 'A'.repeat(100000); // Very large description

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Large Task',
          description: largeDescription,
          projectId: project.id
        })
        .expect(413); // Payload Too Large

      expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });
  });

  describe('Content Negotiation', () => {
    let task;

    beforeEach(async () => {
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id
      });
    });

    it('should return JSON by default', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.type).toBe('application/json');
    });

    it('should reject unsupported Accept headers', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/xml')
        .expect(406);

      expect(response.body.error.code).toBe('NOT_ACCEPTABLE');
    });
  });

  describe('Concurrent Operations', () => {
    let task;

    beforeEach(async () => {
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user.id
      });
    });

    it('should handle concurrent updates correctly', async () => {
      const updates = [
        { title: 'Update 1' },
        { title: 'Update 2' },
        { title: 'Update 3' }
      ];

      const promises = updates.map(update =>
        request(app)
          .put(`/api/tasks/${task.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(update)
      );

      const responses = await Promise.all(promises);

      // All requests should succeed (optimistic locking)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Final state should be consistent
      const finalTask = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(finalTask.body.data.title).toMatch(/Update [123]/);
    });
  });
});