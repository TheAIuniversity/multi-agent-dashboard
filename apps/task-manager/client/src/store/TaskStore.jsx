import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { taskApi } from '../services/taskApi'

// Task status and priority constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed'
}

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

const useTaskStore = create(
  devtools(
    (set, get) => ({
      // State
      tasks: [],
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        search: ''
      },
      
      // Actions
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      // Filtered tasks getter
      getFilteredTasks: () => {
        const { tasks, filters } = get()
        return tasks.filter(task => {
          // Status filter
          if (filters.status !== 'all' && task.status !== filters.status) {
            return false
          }
          
          // Priority filter  
          if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false
          }
          
          // Search filter
          if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
          }
          
          return true
        })
      },
      
      // CRUD Operations
      fetchTasks: async () => {
        set({ loading: true, error: null })
        try {
          const response = await taskApi.getTasks()
          set({ tasks: response.tasks, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },
      
      createTask: async (taskData) => {
        set({ loading: true, error: null })
        try {
          const newTask = await taskApi.createTask(taskData)
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            loading: false
          }))
          return newTask
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      updateTask: async (id, taskData) => {
        set({ loading: true, error: null })
        try {
          const updatedTask = await taskApi.updateTask(id, taskData)
          set((state) => ({
            tasks: state.tasks.map(task => 
              task.id === id ? updatedTask : task
            ),
            loading: false
          }))
          return updatedTask
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      deleteTask: async (id) => {
        set({ loading: true, error: null })
        try {
          await taskApi.deleteTask(id)
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id),
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Optimistic updates for better UX
      toggleTaskStatus: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task) return
        
        const newStatus = task.status === TASK_STATUS.COMPLETED 
          ? TASK_STATUS.PENDING 
          : TASK_STATUS.COMPLETED
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map(t => 
            t.id === id ? { ...t, status: newStatus } : t
          )
        }))
        
        try {
          await taskApi.updateTask(id, { status: newStatus })
        } catch (error) {
          // Revert on error
          set((state) => ({
            tasks: state.tasks.map(t => 
              t.id === id ? { ...t, status: task.status } : t
            ),
            error: error.message
          }))
        }
      }
    }),
    {
      name: 'task-store'
    }
  )
)

// Context provider for React usage
import { createContext, useContext } from 'react'

const TaskContext = createContext()

export const TaskProvider = ({ children }) => {
  const store = useTaskStore()
  
  return (
    <TaskContext.Provider value={store}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within TaskProvider')
  }
  return context
}

export default useTaskStore