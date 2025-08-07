import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useTask } from '../store/TaskStore'
import TaskList from '../components/TaskList'
import TaskFilters from '../components/TaskFilters'
import TaskForm from '../components/TaskForm'
import LoadingSpinner from '../components/LoadingSpinner'

const TasksPage = () => {
  const { 
    fetchTasks, 
    loading, 
    error, 
    getFilteredTasks 
  } = useTask()
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  
  const filteredTasks = getFilteredTasks()
  
  // Load tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  const handleNewTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }
  
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }
  
  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }
  
  if (loading && filteredTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your daily tasks
            </p>
          </div>
          <button
            onClick={handleNewTask}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6">
        <TaskFilters />
      </div>
      
      {/* Task List */}
      <div className="mb-6">
        <TaskList
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          loading={loading}
        />
      </div>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default TasksPage