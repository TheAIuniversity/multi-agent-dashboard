import { vi } from 'vitest'
import { taskApi, handleApiError } from '../taskApi'

// Mock fetch globally
global.fetch = vi.fn()

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
}

describe('taskApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockClear()
  })

  describe('getTasks', () => {
    it('fetches tasks successfully', async () => {
      const mockResponse = { tasks: [mockTask], total: 1 }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await taskApi.getTasks()

      expect(fetch).toHaveBeenCalledWith('http://localhost:3002/api/tasks', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('includes query parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: [] })
      })

      await taskApi.getTasks({ status: 'completed', priority: 'high' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3002/api/tasks?status=completed&priority=high',
        expect.any(Object)
      )
    })
  })

  describe('createTask', () => {
    it('creates task successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask)
      })

      const taskData = { title: 'New Task', priority: 'high' }
      const result = await taskApi.createTask(taskData)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3002/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      expect(result).toEqual(mockTask)
    })
  })

  describe('updateTask', () => {
    it('updates task successfully', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Task' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedTask)
      })

      const updates = { title: 'Updated Task' }
      const result = await taskApi.updateTask('1', updates)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3002/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      expect(result).toEqual(updatedTask)
    })
  })

  describe('deleteTask', () => {
    it('deletes task successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve()
      })

      const result = await taskApi.deleteTask('1')

      expect(fetch).toHaveBeenCalledWith('http://localhost:3002/api/tasks/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toBeNull()
    })
  })

  describe('error handling', () => {
    it('throws ApiError for 400 Bad Request', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid input' })
      })

      await expect(taskApi.getTasks()).rejects.toThrow('Invalid input')
    })

    it('throws ApiError for 404 Not Found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({})
      })

      await expect(taskApi.getTask('999')).rejects.toThrow('HTTP 404: Not Found')
    })

    it('throws ApiError for 500 Server Error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error' })
      })

      await expect(taskApi.getTasks()).rejects.toThrow('Server error')
    })

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Failed to fetch'))

      await expect(taskApi.getTasks()).rejects.toThrow('Network error: Failed to fetch')
    })

    it('handles JSON parsing errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(taskApi.getTasks()).rejects.toThrow('HTTP 400: Bad Request')
    })
  })

  describe('custom API URL', () => {
    it('uses custom API URL from environment', async () => {
      // Mock environment variable
      vi.stubEnv('VITE_API_URL', 'http://custom-api.com')
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: [] })
      })

      // Re-import to get fresh environment
      const { taskApi: customTaskApi } = await vi.importActual('../taskApi')
      await customTaskApi.getTasks()

      expect(fetch).toHaveBeenCalledWith(
        'http://custom-api.com/api/tasks',
        expect.any(Object)
      )
    })
  })
})

describe('handleApiError', () => {
  it('returns appropriate message for 400 error', () => {
    const error = { name: 'ApiError', status: 400 }
    expect(handleApiError(error)).toBe('Invalid request. Please check your input.')
  })

  it('returns appropriate message for 401 error', () => {
    const error = { name: 'ApiError', status: 401 }
    expect(handleApiError(error)).toBe('Authentication required.')
  })

  it('returns appropriate message for 404 error', () => {
    const error = { name: 'ApiError', status: 404 }
    expect(handleApiError(error)).toBe('Resource not found.')
  })

  it('returns appropriate message for 500 error', () => {
    const error = { name: 'ApiError', status: 500 }
    expect(handleApiError(error)).toBe('Server error. Please try again later.')
  })

  it('returns error message for ApiError with custom message', () => {
    const error = { name: 'ApiError', status: 422, message: 'Custom validation error' }
    expect(handleApiError(error)).toBe('Custom validation error')
  })

  it('returns generic message for non-ApiError', () => {
    const error = new Error('Some other error')
    expect(handleApiError(error)).toBe('An unexpected error occurred. Please try again.')
  })
})