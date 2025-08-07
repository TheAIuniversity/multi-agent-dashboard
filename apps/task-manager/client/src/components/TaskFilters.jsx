import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useTask, TASK_STATUS, TASK_PRIORITY } from '../store/TaskStore'

const TaskFilters = () => {
  const { filters, setFilters } = useTask()
  
  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value })
  }
  
  const handleStatusChange = (e) => {
    setFilters({ status: e.target.value })
  }
  
  const handlePriorityChange = (e) => {
    setFilters({ priority: e.target.value })
  }
  
  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: ''
    })
  }
  
  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={handleSearchChange}
              className="form-input pl-10 w-full"
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value={TASK_STATUS.PENDING}>Pending</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.COMPLETED}>Completed</option>
          </select>
        </div>
        
        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={handlePriorityChange}
            className="form-select"
          >
            <option value="all">All Priorities</option>
            <option value={TASK_PRIORITY.HIGH}>High Priority</option>
            <option value={TASK_PRIORITY.MEDIUM}>Medium Priority</option>
            <option value={TASK_PRIORITY.LOW}>Low Priority</option>
          </select>
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status.replace('_', ' ')}
              </span>
            )}
            {filters.priority !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Priority: {filters.priority}
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskFilters