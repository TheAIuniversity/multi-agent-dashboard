import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from '../mocks/server';
import { TextEncoder, TextDecoder } from 'util';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 2000,
  computedStyleSupportsCssVariables: true
});

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window objects that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock WebSocket for real-time tests
global.WebSocket = jest.fn().mockImplementation((url) => ({
  url,
  readyState: 1, // OPEN
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock File and FileReader
global.File = class MockFile {
  constructor(fileBits, fileName, options = {}) {
    this.name = fileName;
    this.size = fileBits.reduce((acc, bit) => acc + bit.length, 0);
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }
};

global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.error = null;
    this.onload = null;
    this.onerror = null;
    this.onabort = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onprogress = null;
  }

  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2;
      this.result = 'mock file content';
      if (this.onload) this.onload({ target: this });
    }, 10);
  }

  readAsDataURL(file) {
    setTimeout(() => {
      this.readyState = 2;
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
      if (this.onload) this.onload({ target: this });
    }, 10);
  }

  abort() {
    this.readyState = 2;
    if (this.onabort) this.onabort({ target: this });
  }
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    write: jest.fn().mockResolvedValue(undefined),
    writeText: jest.fn().mockResolvedValue(undefined),
    read: jest.fn().mockResolvedValue([]),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock geolocation
Object.assign(navigator, {
  geolocation: {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock Notification
global.Notification = jest.fn().mockImplementation((title, options) => ({
  title,
  ...options,
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
global.Notification.requestPermission = jest.fn().mockResolvedValue('granted');
global.Notification.permission = 'granted';

// Custom matchers
expect.extend({
  toHaveFormData(received, expected) {
    const formData = new FormData(received);
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of Object.entries(expected)) {
      const formValue = formData.get(key);
      if (formValue !== value) {
        return {
          message: () => `Expected form to have ${key}="${value}", but got "${formValue}"`,
          pass: false,
        };
      }
    }
    
    return {
      message: () => `Expected form not to have matching data`,
      pass: true,
    };
  },

  toBeValidTask(received) {
    const requiredFields = ['id', 'title', 'status', 'priority', 'createdAt'];
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length === 0) {
      return {
        message: () => `Expected object not to be a valid task`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected object to be a valid task, missing: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
  },

  toHaveAccessibleName(received, expectedName) {
    const element = received instanceof HTMLElement ? received : received.container?.firstChild;
    if (!element) {
      return {
        message: () => 'Expected element to exist',
        pass: false,
      };
    }

    const accessibleName = element.getAttribute('aria-label') || 
                          element.getAttribute('aria-labelledby') ||
                          element.textContent;

    if (accessibleName === expectedName) {
      return {
        message: () => `Expected element not to have accessible name "${expectedName}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to have accessible name "${expectedName}", got "${accessibleName}"`,
        pass: false,
      };
    }
  }
});

// Setup MSW (Mock Service Worker) for API mocking
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn'
  });
});

afterEach(() => {
  server.resetHandlers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

afterAll(() => {
  server.close();
});

// Global test utilities
global.testUtils = {
  // Create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Create mock task data
  createMockTask: (overrides = {}) => ({
    id: 'task-123',
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 'medium',
    projectId: 'project-123',
    assigneeId: 'user-123',
    createdBy: 'user-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    dueDate: null,
    ...overrides
  }),

  // Create mock project data
  createMockProject: (overrides = {}) => ({
    id: 'project-123',
    name: 'Test Project',
    description: 'Test project description',
    status: 'active',
    organizationId: 'org-123',
    createdBy: 'user-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  // Wait for component to update
  waitFor: (callback, options = {}) => {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 1000;
      const interval = options.interval || 50;
      const startTime = Date.now();

      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
          } else {
            setTimeout(check, interval);
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(check, interval);
          }
        }
      };

      check();
    });
  },

  // Simulate user typing
  userType: async (element, text, options = {}) => {
    const { fireEvent } = await import('@testing-library/react');
    
    element.focus();
    element.value = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      element.value += char;
      
      fireEvent.input(element, { target: { value: element.value } });
      
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    }
  },

  // Simulate file upload
  uploadFile: (input, file) => {
    const { fireEvent } = require('@testing-library/react');
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
  }
};

// Console suppression for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = (...args) => {
    // Allow React error boundary errors and testing-library errors
    if (
      args[0]?.includes?.('Error: Uncaught [Error: ') ||
      args[0]?.includes?.('Warning: ') ||
      args[0]?.includes?.('The above error occurred')
    ) {
      originalError(...args);
    }
  };
  
  console.warn = (...args) => {
    // Suppress most warnings unless they contain specific keywords
    if (args[0]?.includes?.('act(') || args[0]?.includes?.('test')) {
      originalWarn(...args);
    }
  };
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});