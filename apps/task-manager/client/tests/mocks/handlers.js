import { rest } from 'msw';

const API_BASE_URL = 'http://localhost:3001/api';

// Mock data generators
const createMockTask = (overrides = {}) => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Task',
  description: 'Mock task description',
  status: 'todo',
  priority: 'medium',
  projectId: 'project-123',
  assigneeId: 'user-123',
  createdBy: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueDate: null,
  assignee: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  project: {
    id: 'project-123',
    name: 'Test Project',
    organizationId: 'org-123'
  },
  createdByUser: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  },
  _count: {
    comments: 0,
    attachments: 0
  },
  ...overrides
});

const createMockProject = (overrides = {}) => ({
  id: `project-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Mock Project',
  description: 'Mock project description',
  status: 'active',
  organizationId: 'org-123',
  createdBy: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  organization: {
    id: 'org-123',
    name: 'Test Organization',
    ownerId: 'user-123'
  },
  createdByUser: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  },
  _count: {
    tasks: 0
  },
  ...overrides
});

const createMockUser = (overrides = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// In-memory data store for tests
let mockTasks = [];
let mockProjects = [];
let mockUsers = [];

export const handlers = [
  // Authentication endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user: createMockUser({ email }),
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    const { email, name, password } = req.body;
    
    // Simple validation
    if (!email || !name || !password) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: []
          }
        })
      );
    }
    
    const user = createMockUser({ email, name });
    mockUsers.push(user);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { message: 'Logged out successfully' }
      })
    );
  }),

  // Task endpoints
  rest.get(`${API_BASE_URL}/tasks`, (req, res, ctx) => {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    
    let filteredTasks = mockTasks;
    
    if (projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === projectId);
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          tasks: paginatedTasks,
          total: filteredTasks.length,
          page,
          limit
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/tasks/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const task = mockTasks.find(t => t.id === id);
    
    if (!task) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found'
          }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: task
      })
    );
  }),

  rest.post(`${API_BASE_URL}/tasks`, (req, res, ctx) => {
    const taskData = req.body;
    
    // Validation
    if (!taskData.title || !taskData.projectId) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: [
              ...(!taskData.title ? [{ field: 'title', message: 'Title is required' }] : []),
              ...(!taskData.projectId ? [{ field: 'projectId', message: 'Project ID is required' }] : [])
            ]
          }
        })
      );
    }
    
    const newTask = createMockTask({
      ...taskData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mockTasks.push(newTask);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newTask
      })
    );
  }),

  rest.put(`${API_BASE_URL}/tasks/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body;
    
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found'
          }
        })
      );
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockTasks[taskIndex]
      })
    );
  }),

  rest.delete(`${API_BASE_URL}/tasks/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found'
          }
        })
      );
    }
    
    mockTasks.splice(taskIndex, 1);
    
    return res(ctx.status(204));
  }),

  // Project endpoints
  rest.get(`${API_BASE_URL}/projects`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          projects: mockProjects,
          total: mockProjects.length,
          page: 1,
          limit: 20
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/projects/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const project = mockProjects.find(p => p.id === id);
    
    if (!project) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found'
          }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: project
      })
    );
  }),

  rest.post(`${API_BASE_URL}/projects`, (req, res, ctx) => {
    const projectData = req.body;
    
    if (!projectData.name || !projectData.organizationId) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields'
          }
        })
      );
    }
    
    const newProject = createMockProject({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mockProjects.push(newProject);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newProject
      })
    );
  }),

  // User endpoints
  rest.get(`${API_BASE_URL}/users/profile`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockUser()
      })
    );
  }),

  rest.put(`${API_BASE_URL}/users/profile`, (req, res, ctx) => {
    const updates = req.body;
    const updatedUser = createMockUser({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: updatedUser
      })
    );
  }),

  // Error handling for unmatched requests
  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled GET request to ${req.url.toString()}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      })
    );
  }),

  rest.post('*', (req, res, ctx) => {
    console.warn(`Unhandled POST request to ${req.url.toString()}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      })
    );
  })
];

// Helper functions to manage mock data in tests
export const mockDataHelpers = {
  resetData: () => {
    mockTasks = [];
    mockProjects = [];
    mockUsers = [];
  },
  
  addTask: (task) => {
    const newTask = createMockTask(task);
    mockTasks.push(newTask);
    return newTask;
  },
  
  addProject: (project) => {
    const newProject = createMockProject(project);
    mockProjects.push(newProject);
    return newProject;
  },
  
  addUser: (user) => {
    const newUser = createMockUser(user);
    mockUsers.push(newUser);
    return newUser;
  },
  
  getTasks: () => [...mockTasks],
  getProjects: () => [...mockProjects],
  getUsers: () => [...mockUsers]
};