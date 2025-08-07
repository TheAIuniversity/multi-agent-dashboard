const WebSocket = require('ws');
const request = require('supertest');
const app = require('../../../src/app');
const { FactoryManager } = require('../../factories');

describe('WebSocket Real-time Functionality', () => {
  let factory, server, wsServer;
  let user1, user2, token1, token2;
  let project, organization;

  beforeAll(async () => {
    // Start HTTP server for WebSocket upgrade
    server = app.listen(0);
    const port = server.address().port;
    process.env.TEST_SERVER_PORT = port;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    factory = new FactoryManager(global.testUtils.prisma);

    // Create two users for testing real-time collaboration
    const userData1 = await factory.user.createWithToken({
      email: 'user1@example.com',
      name: 'User One'
    });
    const userData2 = await factory.user.createWithToken({
      email: 'user2@example.com', 
      name: 'User Two'
    });

    user1 = userData1.user;
    user2 = userData2.user;
    token1 = userData1.token;
    token2 = userData2.token;

    // Create shared project
    const orgData = await factory.user.createWithOrganization({}, { id: user1.id });
    organization = orgData.organization;
    
    project = await factory.project.create({
      organizationId: organization.id,
      createdBy: user1.id
    });

    // Add user2 to the team
    const team = await global.testUtils.prisma.team.create({
      data: {
        id: global.testUtils.generateTestUser().id,
        organizationId: organization.id,
        name: 'Test Team',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await global.testUtils.prisma.teamMember.createMany({
      data: [
        { teamId: team.id, userId: user1.id, role: 'owner', joinedAt: new Date() },
        { teamId: team.id, userId: user2.id, role: 'member', joinedAt: new Date() }
      ]
    });
  });

  const createWebSocketConnection = (token) => {
    const port = process.env.TEST_SERVER_PORT;
    const ws = new WebSocket(`ws://localhost:${port}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return ws;
  };

  const waitForMessage = (ws, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('WebSocket message timeout'));
      }, timeout);

      ws.once('message', (data) => {
        clearTimeout(timer);
        resolve(JSON.parse(data.toString()));
      });
    });
  };

  describe('Connection Management', () => {
    it('should establish WebSocket connection with valid token', async () => {
      const ws = createWebSocketConnection(token1);
      
      await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });

    it('should reject connection with invalid token', async () => {
      const ws = createWebSocketConnection('invalid-token');
      
      await new Promise((resolve) => {
        ws.on('error', resolve);
        ws.on('close', resolve);
        setTimeout(resolve, 2000);
      });

      expect(ws.readyState).toBe(WebSocket.CLOSED);
    });

    it('should send connection confirmation on successful connect', async () => {
      const ws = createWebSocketConnection(token1);
      
      await new Promise((resolve) => ws.on('open', resolve));
      
      const message = await waitForMessage(ws);
      expect(message.type).toBe('connected');
      expect(message.payload.userId).toBe(user1.id);
      expect(message.payload.timestamp).toBeDefined();

      ws.close();
    });

    it('should handle connection cleanup on disconnect', async () => {
      const ws = createWebSocketConnection(token1);
      
      await new Promise((resolve) => ws.on('open', resolve));
      
      // Join project room
      ws.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));

      // Wait for join confirmation
      await waitForMessage(ws);

      ws.close();

      // Verify user is removed from project room
      // This would typically be tested by checking server state
      // or by having another client in the room observe the user_offline event
    });
  });

  describe('Project Room Management', () => {
    let ws1, ws2;

    beforeEach(async () => {
      ws1 = createWebSocketConnection(token1);
      ws2 = createWebSocketConnection(token2);

      await Promise.all([
        new Promise((resolve) => ws1.on('open', resolve)),
        new Promise((resolve) => ws2.on('open', resolve))
      ]);

      // Skip connection messages
      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);
    });

    afterEach(() => {
      if (ws1 && ws1.readyState === WebSocket.OPEN) ws1.close();
      if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.close();
    });

    it('should allow users to join project rooms', async () => {
      ws1.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));

      const response = await waitForMessage(ws1);
      expect(response.type).toBe('join_project_success');
      expect(response.payload.projectId).toBe(project.id);
    });

    it('should broadcast user online status when joining project', async () => {
      // User2 joins first to receive user1's online status
      ws2.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));
      await waitForMessage(ws2); // join success

      // User1 joins the project
      ws1.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));
      await waitForMessage(ws1); // join success for user1

      // User2 should receive user_online event
      const onlineEvent = await waitForMessage(ws2);
      expect(onlineEvent.type).toBe('user_online');
      expect(onlineEvent.payload.user.id).toBe(user1.id);
      expect(onlineEvent.payload.projectId).toBe(project.id);
    });

    it('should broadcast user offline status when leaving project', async () => {
      // Both users join project
      ws1.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));
      ws2.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));

      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      // User1 leaves project
      ws1.send(JSON.stringify({
        type: 'leave_project',
        payload: { projectId: project.id }
      }));

      // User2 should receive user_offline event
      const offlineEvent = await waitForMessage(ws2);
      expect(offlineEvent.type).toBe('user_offline');
      expect(offlineEvent.payload.userId).toBe(user1.id);
      expect(offlineEvent.payload.projectId).toBe(project.id);
    });

    it('should prevent unauthorized users from joining project', async () => {
      // Create user not in project team
      const outsiderData = await factory.user.createWithToken({
        email: 'outsider@example.com'
      });
      const outsiderWs = createWebSocketConnection(outsiderData.token);

      await new Promise((resolve) => outsiderWs.on('open', resolve));
      await waitForMessage(outsiderWs); // connection message

      outsiderWs.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));

      const response = await waitForMessage(outsiderWs);
      expect(response.type).toBe('error');
      expect(response.payload.code).toBe('FORBIDDEN');

      outsiderWs.close();
    });
  });

  describe('Real-time Task Updates', () => {
    let ws1, ws2;

    beforeEach(async () => {
      ws1 = createWebSocketConnection(token1);
      ws2 = createWebSocketConnection(token2);

      await Promise.all([
        new Promise((resolve) => ws1.on('open', resolve)),
        new Promise((resolve) => ws2.on('open', resolve))
      ]);

      // Skip connection messages and join project
      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      // Both users join project
      ws1.send(JSON.stringify({
        type: 'join_project', 
        payload: { projectId: project.id }
      }));
      ws2.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));

      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      // Skip user_online events
      await Promise.all([
        waitForMessage(ws1).catch(() => {}),
        waitForMessage(ws2).catch(() => {})
      ]);
    });

    afterEach(() => {
      if (ws1 && ws1.readyState === WebSocket.OPEN) ws1.close();
      if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.close();
    });

    it('should broadcast task creation to project members', async () => {
      const taskData = {
        title: 'Real-time Task',
        description: 'Created via WebSocket',
        priority: 'high',
        projectId: project.id
      };

      // Create task via HTTP API (simulating external creation)
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token1}`)
        .send(taskData)
        .expect(201);

      // Both users should receive task_created event
      const events = await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      events.forEach(event => {
        expect(event.type).toBe('task_created');
        expect(event.payload.task.id).toBe(createResponse.body.data.id);
        expect(event.payload.task.title).toBe(taskData.title);
        expect(event.payload.author.id).toBe(user1.id);
        expect(event.payload.projectId).toBe(project.id);
      });
    });

    it('should broadcast task updates to project members', async () => {
      // Create a task first
      const task = await factory.task.create({
        projectId: project.id,
        createdBy: user1.id,
        assigneeId: user2.id
      });

      const updateData = {
        status: 'in_progress',
        priority: 'urgent'
      };

      // Update task via HTTP API
      await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send(updateData)
        .expect(200);

      // Both users should receive task_updated event
      const events = await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      events.forEach(event => {
        expect(event.type).toBe('task_updated');
        expect(event.payload.taskId).toBe(task.id);
        expect(event.payload.updates).toMatchObject(updateData);
        expect(event.payload.updatedBy.id).toBe(user2.id);
        expect(event.payload.projectId).toBe(project.id);
      });
    });

    it('should broadcast task deletion to project members', async () => {
      // Create a task first
      const task = await factory.task.create({
        projectId: project.id,
        createdBy: user1.id
      });

      // Delete task via HTTP API
      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(204);

      // Both users should receive task_deleted event
      const events = await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      events.forEach(event => {
        expect(event.type).toBe('task_deleted');
        expect(event.payload.taskId).toBe(task.id);
        expect(event.payload.deletedBy.id).toBe(user1.id);
        expect(event.payload.projectId).toBe(project.id);
      });
    });

    it('should handle WebSocket task creation', async () => {
      const taskData = {
        title: 'WebSocket Created Task',
        description: 'Created directly via WebSocket',
        priority: 'medium',
        assigneeId: user2.id
      };

      ws1.send(JSON.stringify({
        type: 'task_create',
        payload: {
          ...taskData,
          projectId: project.id
        }
      }));

      // Both users should receive task_created event
      const events = await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      events.forEach(event => {
        expect(event.type).toBe('task_created');
        expect(event.payload.task.title).toBe(taskData.title);
        expect(event.payload.task.assigneeId).toBe(user2.id);
        expect(event.payload.author.id).toBe(user1.id);
      });
    });
  });

  describe('Comment System', () => {
    let ws1, ws2, task;

    beforeEach(async () => {
      ws1 = createWebSocketConnection(token1);
      ws2 = createWebSocketConnection(token2);

      await Promise.all([
        new Promise((resolve) => ws1.on('open', resolve)),
        new Promise((resolve) => ws2.on('open', resolve))
      ]);

      // Setup project rooms
      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      ws1.send(JSON.stringify({
        type: 'join_project',
        payload: { projectId: project.id }
      }));
      ws2.send(JSON.stringify({
        type: 'join_project', 
        payload: { projectId: project.id }
      }));

      await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      // Create task for commenting
      task = await factory.task.create({
        projectId: project.id,
        createdBy: user1.id,
        assigneeId: user2.id
      });

      // Skip user_online events
      await Promise.all([
        waitForMessage(ws1).catch(() => {}),
        waitForMessage(ws2).catch(() => {})
      ]);
    });

    afterEach(() => {
      if (ws1 && ws1.readyState === WebSocket.OPEN) ws1.close();
      if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.close();
    });

    it('should broadcast new comments to project members', async () => {
      const commentData = {
        taskId: task.id,
        content: 'This is a real-time comment'
      };

      ws1.send(JSON.stringify({
        type: 'comment_add',
        payload: commentData
      }));

      // Both users should receive comment_added event
      const events = await Promise.all([
        waitForMessage(ws1),
        waitForMessage(ws2)
      ]);

      events.forEach(event => {
        expect(event.type).toBe('comment_added');
        expect(event.payload.comment.content).toBe(commentData.content);
        expect(event.payload.comment.author.id).toBe(user1.id);
        expect(event.payload.taskId).toBe(task.id);
        expect(event.payload.projectId).toBe(project.id);
      });
    });

    it('should handle typing indicators', async () => {
      // User1 starts typing
      ws1.send(JSON.stringify({
        type: 'typing_start',
        payload: { taskId: task.id }
      }));

      // User2 should receive typing indicator
      const typingEvent = await waitForMessage(ws2);
      expect(typingEvent.type).toBe('user_typing');
      expect(typingEvent.payload.user.id).toBe(user1.id);
      expect(typingEvent.payload.taskId).toBe(task.id);

      // User1 stops typing
      ws1.send(JSON.stringify({
        type: 'typing_stop',
        payload: { taskId: task.id }
      }));

      // Implementation would need to handle typing_stop event
      // This might clear the typing indicator after a timeout
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let ws;

    beforeEach(async () => {
      ws = createWebSocketConnection(token1);
      await new Promise((resolve) => ws.on('open', resolve));
      await waitForMessage(ws); // connection message
    });

    afterEach(() => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    });

    it('should handle malformed message gracefully', async () => {
      ws.send('invalid json');

      const errorEvent = await waitForMessage(ws);
      expect(errorEvent.type).toBe('error');
      expect(errorEvent.payload.code).toBe('INVALID_MESSAGE_FORMAT');
    });

    it('should handle unknown event types', async () => {
      ws.send(JSON.stringify({
        type: 'unknown_event',
        payload: { data: 'test' }
      }));

      const errorEvent = await waitForMessage(ws);
      expect(errorEvent.type).toBe('error');
      expect(errorEvent.payload.code).toBe('UNKNOWN_EVENT_TYPE');
    });

    it('should validate event payloads', async () => {
      ws.send(JSON.stringify({
        type: 'join_project',
        payload: { invalidField: 'test' } // Missing projectId
      }));

      const errorEvent = await waitForMessage(ws);
      expect(errorEvent.type).toBe('validation_error');
      expect(errorEvent.payload.field).toBe('projectId');
    });

    it('should handle connection interruptions gracefully', async () => {
      // Simulate network interruption
      ws.terminate();

      // Reconnect
      const newWs = createWebSocketConnection(token1);
      await new Promise((resolve) => newWs.on('open', resolve));
      
      const reconnectMessage = await waitForMessage(newWs);
      expect(reconnectMessage.type).toBe('connected');
      expect(reconnectMessage.payload.userId).toBe(user1.id);

      newWs.close();
    });

    it('should enforce rate limiting on WebSocket messages', async () => {
      const messages = [];
      
      // Send many messages rapidly
      for (let i = 0; i < 50; i++) {
        ws.send(JSON.stringify({
          type: 'join_project',
          payload: { projectId: project.id }
        }));
      }

      // Should receive rate limit error
      let rateLimitHit = false;
      for (let i = 0; i < 10; i++) {
        try {
          const message = await waitForMessage(ws);
          if (message.type === 'rate_limit_error') {
            rateLimitHit = true;
            break;
          }
        } catch (e) {
          break;
        }
      }

      expect(rateLimitHit).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent connections', async () => {
      const connections = [];
      const connectionPromises = [];

      // Create 10 concurrent connections
      for (let i = 0; i < 10; i++) {
        const userData = await factory.user.createWithToken({
          email: `user${i}@example.com`
        });
        const ws = createWebSocketConnection(userData.token);
        connections.push(ws);
        connectionPromises.push(
          new Promise((resolve) => ws.on('open', resolve))
        );
      }

      // Wait for all connections to open
      await Promise.all(connectionPromises);

      // All connections should be open
      connections.forEach(ws => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      // Clean up
      connections.forEach(ws => ws.close());
    });

    it('should efficiently broadcast to large rooms', async () => {
      const connections = [];
      const users = [];

      // Create multiple users and connections
      for (let i = 0; i < 5; i++) {
        const userData = await factory.user.createWithToken({
          email: `roomuser${i}@example.com`
        });
        users.push(userData.user);
        
        const ws = createWebSocketConnection(userData.token);
        connections.push(ws);
        
        await new Promise((resolve) => ws.on('open', resolve));
        await waitForMessage(ws); // connection message
        
        // Join project room
        ws.send(JSON.stringify({
          type: 'join_project',
          payload: { projectId: project.id }
        }));
        await waitForMessage(ws); // join success
      }

      // Create task - should broadcast to all room members
      const task = await factory.task.create({
        projectId: project.id,
        createdBy: user1.id
      });

      // All connections should receive the broadcast
      const events = await Promise.all(
        connections.map(ws => waitForMessage(ws))
      );

      events.forEach(event => {
        expect(event.type).toBe('task_created');
        expect(event.payload.task.id).toBe(task.id);
      });

      // Clean up
      connections.forEach(ws => ws.close());
    });
  });
});