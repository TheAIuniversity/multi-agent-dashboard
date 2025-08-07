import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskForm from '../TaskForm'
import { TaskProvider } from '../../store/TaskStore'
import { TASK_STATUS, TASK_PRIORITY } from '../../store/TaskStore'

// Mock the task store
const mockCreateTask = vi.fn()
const mockUpdateTask = vi.fn()

vi.mock('../../store/TaskStore', async () => {
  const actual = await vi.importActual('../../store/TaskStore')
  return {
    ...actual,
    useTask: () => ({
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
      loading: false
    })
  }
})

const mockTask = {
  id: '1',
  title: 'Existing Task',
  description: 'Existing description',
  status: TASK_STATUS.IN_PROGRESS,
  priority: TASK_PRIORITY.HIGH,
  due_date: '2023-12-31T00:00:00.000Z'
}

const renderTaskForm = (task = null, onClose = vi.fn()) => {
  return render(
    <TaskProvider>
      <TaskForm task={task} onClose={onClose} />
    </TaskProvider>
  )
}

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('renders create form correctly', () => {
      renderTaskForm()
      
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/)).toHaveValue('')
      expect(screen.getByLabelText(/Description/)).toHaveValue('')
      expect(screen.getByLabelText(/Priority/)).toHaveValue(TASK_PRIORITY.MEDIUM)
      expect(screen.getByText('Create Task')).toBeInTheDocument()
    })

    it('creates task with valid data', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      mockCreateTask.mockResolvedValue({ id: '2' })
      
      renderTaskForm(null, mockOnClose)
      
      await user.type(screen.getByLabelText(/Title/), 'New Task')
      await user.type(screen.getByLabelText(/Description/), 'New description')
      await user.selectOptions(screen.getByLabelText(/Priority/), TASK_PRIORITY.HIGH)
      await user.type(screen.getByLabelText(/Due Date/), '2023-12-31')
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New description',
          priority: TASK_PRIORITY.HIGH,
          status: TASK_STATUS.PENDING,
          due_date: '2023-12-31T00:00:00.000Z'
        })
      })
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Edit Mode', () => {
    it('renders edit form with existing data', () => {
      renderTaskForm(mockTask)
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/)).toHaveValue('Existing Task')
      expect(screen.getByLabelText(/Description/)).toHaveValue('Existing description')
      expect(screen.getByLabelText(/Priority/)).toHaveValue(TASK_PRIORITY.HIGH)
      expect(screen.getByLabelText(/Status/)).toHaveValue(TASK_STATUS.IN_PROGRESS)
      expect(screen.getByText('Update Task')).toBeInTheDocument()
    })

    it('updates task with modified data', async () => {
      const user = userEvent.setup()
      const mockOnClose = vi.fn()
      mockUpdateTask.mockResolvedValue({ ...mockTask })
      
      renderTaskForm(mockTask, mockOnClose)
      
      await user.clear(screen.getByLabelText(/Title/))
      await user.type(screen.getByLabelText(/Title/), 'Updated Task')
      
      fireEvent.click(screen.getByText('Update Task'))
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({
          title: 'Updated Task'
        }))
      })
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('shows status field only in edit mode', () => {
      renderTaskForm(mockTask)
      expect(screen.getByLabelText(/Status/)).toBeInTheDocument()
      
      renderTaskForm()
      expect(screen.queryByLabelText(/Status/)).not.toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('shows error for empty title', async () => {
      const user = userEvent.setup()
      renderTaskForm()
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      expect(mockCreateTask).not.toHaveBeenCalled()
    })

    it('shows error for title too long', async () => {
      const user = userEvent.setup()
      renderTaskForm()
      
      const longTitle = 'a'.repeat(256)
      await user.type(screen.getByLabelText(/Title/), longTitle)
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(screen.getByText('Title must be less than 255 characters')).toBeInTheDocument()
      })
    })

    it('shows error for description too long', async () => {
      const user = userEvent.setup()
      renderTaskForm()
      
      await user.type(screen.getByLabelText(/Title/), 'Valid Title')
      
      const longDescription = 'a'.repeat(2001)
      await user.type(screen.getByLabelText(/Description/), longDescription)
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(screen.getByText('Description must be less than 2000 characters')).toBeInTheDocument()
      })
    })

    it('shows error for past due date', async () => {
      const user = userEvent.setup()
      renderTaskForm()
      
      await user.type(screen.getByLabelText(/Title/), 'Valid Title')
      await user.type(screen.getByLabelText(/Due Date/), '2020-01-01')
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument()
      })
    })

    it('clears errors when user starts typing', async () => {
      const user = userEvent.setup()
      renderTaskForm()
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/Title/), 'T')
      
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    })
  })

  describe('User Interaction', () => {
    it('closes form when close button is clicked', () => {
      const mockOnClose = vi.fn()
      renderTaskForm(null, mockOnClose)
      
      fireEvent.click(screen.getByRole('button', { name: '' })) // X button
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes form when cancel button is clicked', () => {
      const mockOnClose = vi.fn()
      renderTaskForm(null, mockOnClose)
      
      fireEvent.click(screen.getByText('Cancel'))
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes form when background overlay is clicked', () => {
      const mockOnClose = vi.fn()
      renderTaskForm(null, mockOnClose)
      
      fireEvent.click(document.querySelector('.bg-gray-500'))
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('disables form during loading', () => {
      // Mock loading state
      vi.mocked(vi.importActual('../../store/TaskStore')).useTask = () => ({
        createTask: mockCreateTask,
        updateTask: mockUpdateTask,
        loading: true
      })
      
      renderTaskForm()
      
      expect(screen.getByLabelText(/Title/)).toBeDisabled()
      expect(screen.getByLabelText(/Description/)).toBeDisabled()
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderTaskForm()
      
      expect(screen.getByLabelText(/Title \*/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument()
    })

    it('associates error messages with form fields', async () => {
      renderTaskForm()
      
      fireEvent.click(screen.getByText('Create Task'))
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Title/)
        const errorMessage = screen.getByText('Title is required')
        
        expect(titleInput).toHaveClass('border-red-300')
        expect(errorMessage).toHaveClass('text-red-600')
      })
    })

    it('has proper modal semantics', () => {
      renderTaskForm()
      
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
    })
  })
})