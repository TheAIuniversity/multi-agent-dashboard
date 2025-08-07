import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TaskItem from '../TaskItem'
import { TaskProvider } from '../../store/TaskStore'
import { TASK_STATUS, TASK_PRIORITY } from '../../store/TaskStore'

// Mock the task store
const mockToggleTaskStatus = vi.fn()
const mockDeleteTask = vi.fn()

vi.mock('../../store/TaskStore', async () => {
  const actual = await vi.importActual('../../store/TaskStore')
  return {
    ...actual,
    useTask: () => ({
      toggleTaskStatus: mockToggleTaskStatus,
      deleteTask: mockDeleteTask
    })
  }
})

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task',
  status: TASK_STATUS.PENDING,
  priority: TASK_PRIORITY.MEDIUM,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  due_date: '2023-12-31T00:00:00.000Z'
}

const renderTaskItem = (task = mockTask, onEdit = vi.fn()) => {
  return render(
    <TaskProvider>
      <TaskItem task={task} onEdit={onEdit} />
    </TaskProvider>
  )
}

describe('TaskItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    renderTaskItem()
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('This is a test task')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText(/Created Jan 1, 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Due Dec 31, 2023/)).toBeInTheDocument()
  })

  it('shows correct status icon for pending task', () => {
    renderTaskItem()
    
    const statusButton = screen.getByLabelText('Mark as complete')
    expect(statusButton).toBeInTheDocument()
  })

  it('shows correct status icon for completed task', () => {
    const completedTask = { ...mockTask, status: TASK_STATUS.COMPLETED }
    renderTaskItem(completedTask)
    
    const statusButton = screen.getByLabelText('Mark as incomplete')
    expect(statusButton).toBeInTheDocument()
  })

  it('applies completed styling to finished tasks', () => {
    const completedTask = { ...mockTask, status: TASK_STATUS.COMPLETED }
    renderTaskItem(completedTask)
    
    const title = screen.getByText('Test Task')
    expect(title).toHaveClass('line-through')
  })

  it('calls toggleTaskStatus when status button is clicked', async () => {
    renderTaskItem()
    
    const statusButton = screen.getByLabelText('Mark as complete')
    fireEvent.click(statusButton)
    
    expect(mockToggleTaskStatus).toHaveBeenCalledWith('1')
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    renderTaskItem(mockTask, mockOnEdit)
    
    const editButton = screen.getByLabelText('Edit task')
    fireEvent.click(editButton)
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('shows delete confirmation and calls deleteTask', () => {
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true))
    
    renderTaskItem()
    
    const deleteButton = screen.getByLabelText('Delete task')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
    expect(mockDeleteTask).toHaveBeenCalledWith('1')
  })

  it('does not delete when confirmation is cancelled', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    
    renderTaskItem()
    
    const deleteButton = screen.getByLabelText('Delete task')
    fireEvent.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteTask).not.toHaveBeenCalled()
  })

  it('displays high priority with warning icon', () => {
    const highPriorityTask = { ...mockTask, priority: TASK_PRIORITY.HIGH }
    renderTaskItem(highPriorityTask)
    
    expect(screen.getByText('high')).toBeInTheDocument()
    // Priority badge should have red styling
    const priorityBadge = screen.getByText('high').parentElement
    expect(priorityBadge).toHaveClass('text-red-600')
  })

  it('handles task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: null }
    renderTaskItem(taskWithoutDescription)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('This is a test task')).not.toBeInTheDocument()
  })

  it('handles task without due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null }
    renderTaskItem(taskWithoutDueDate)
    
    expect(screen.getByText(/Created Jan 1, 2023/)).toBeInTheDocument()
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderTaskItem()
    
    expect(screen.getByLabelText('Mark as complete')).toBeInTheDocument()
    expect(screen.getByLabelText('Edit task')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete task')).toBeInTheDocument()
  })
})