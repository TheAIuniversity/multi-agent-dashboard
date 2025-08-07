import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useTask, TASK_STATUS, TASK_PRIORITY } from '../store/TaskStore'
import LoadingSpinner from './LoadingSpinner'

const TaskForm = ({ task, onClose }) => {
  const { createTask, updateTask, loading } = useTask()
  const isEditing = !!task
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || TASK_PRIORITY.MEDIUM,
    status: task?.status || TASK_STATUS.PENDING,
    due_date: task?.due_date ? task.due_date.split('T')[0] : ''
  })
  
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }
    
    if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }
    
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const submitData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      }
      
      if (isEditing) {
        await updateTask(task.id, submitData)
      } else {
        await createTask(submitData)
      }
      
      onClose()
    } catch (error) {
      // Error is handled by the store and will be displayed in the main UI
      console.error('Form submission error:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input mt-1 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter task title..."
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea mt-1 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter task description..."
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              {/* Priority and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-select mt-1"
                    disabled={loading}
                  >
                    <option value={TASK_PRIORITY.LOW}>Low</option>
                    <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                    <option value={TASK_PRIORITY.HIGH}>High</option>
                  </select>
                </div>
                
                {/* Status (only show when editing) */}
                {isEditing && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select mt-1"
                      disabled={loading}
                    >
                      <option value={TASK_STATUS.PENDING}>Pending</option>
                      <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                      <option value={TASK_STATUS.COMPLETED}>Completed</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className={`form-input mt-1 ${errors.due_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                {loading && <LoadingSpinner size="small" />}
                {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TaskForm