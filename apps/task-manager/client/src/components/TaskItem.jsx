import { useState } from 'react'
import { format } from 'date-fns'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { useTask, TASK_STATUS, TASK_PRIORITY } from '../store/TaskStore'
import clsx from 'clsx'

const TaskItem = ({ task, onEdit }) => {
  const { toggleTaskStatus, deleteTask } = useTask()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleToggleStatus = async () => {
    await toggleTaskStatus(task.id)
  }
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true)
      try {
        await deleteTask(task.id)
      } catch (error) {
        setIsDeleting(false)
        // Error is handled by the store
      }
    }
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.HIGH:
        return 'text-red-600 bg-red-50 border-red-200'
      case TASK_PRIORITY.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case TASK_PRIORITY.LOW:
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return <CheckCircleSolid className="h-5 w-5 text-green-500" />
      case TASK_STATUS.IN_PROGRESS:
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }
  
  const isCompleted = task.status === TASK_STATUS.COMPLETED
  
  return (
    <div className={clsx(
      'task-item',
      isCompleted && 'opacity-75',
      isDeleting && 'opacity-50 pointer-events-none'
    )}>
      <div className="flex items-start gap-4">
        {/* Status Toggle */}
        <button
          onClick={handleToggleStatus}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {getStatusIcon(task.status)}
        </button>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={clsx(
                'text-sm font-medium',
                isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={clsx(
                  'mt-1 text-sm',
                  isCompleted ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {task.description}
                </p>
              )}
              
              {/* Metadata */}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                </span>
                
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Priority Badge */}
            <div className="flex items-center gap-2 ml-4">
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium border',
                getPriorityColor(task.priority)
              )}>
                {task.priority === TASK_PRIORITY.HIGH && (
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                )}
                {task.priority}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Edit task"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            aria-label="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem