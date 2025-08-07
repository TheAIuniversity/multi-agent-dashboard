import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline' 
import TaskItem from './TaskItem'
import LoadingSpinner from './LoadingSpinner'

const TaskList = ({ tasks, onEditTask, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first task.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={() => onEditTask(task)}
        />
      ))}
    </div>
  )
}

export default TaskList