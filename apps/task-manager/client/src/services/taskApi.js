// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

class ApiError extends Error {
  constructor(message, status, response) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}

// HTTP client with error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or parsing errors
    throw new ApiError(
      `Network error: ${error.message}`,
      0,
      null
    )
  }
}

// Task API methods
export const taskApi = {
  // Get all tasks with optional filtering
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`
    return await apiRequest(endpoint)
  },
  
  // Get task by ID
  async getTask(id) {
    return await apiRequest(`/api/tasks/${id}`)
  },
  
  // Create new task
  async createTask(taskData) {
    return await apiRequest('/api/tasks', {
      method: 'POST',
      body: taskData,
    })
  },
  
  // Update existing task
  async updateTask(id, taskData) {
    return await apiRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    })
  },
  
  // Delete task
  async deleteTask(id) {
    return await apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
  },
}

// Utility function for handling API errors in components
export function handleApiError(error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 409:
        return 'Conflict. The resource already exists.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return error.message
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}