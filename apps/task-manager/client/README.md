# Task Manager Frontend

A modern React task management application built with Vite, Tailwind CSS, and Zustand.

## Features

- ✅ Create, read, update, and delete tasks 
- 🔍 Search and filter tasks by status and priority
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🧪 Component testing with Vitest and Testing Library
- 🔄 Real-time state management with Zustand
- ♿ Accessibility-first design
- 📱 Mobile-responsive layout

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Testing**: Vitest + Testing Library
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API endpoint (default: `http://localhost:3002`)

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # App layout wrapper
│   ├── TaskList.jsx    # Task list container
│   ├── TaskItem.jsx    # Individual task component
│   ├── TaskForm.jsx    # Add/edit task modal
│   ├── TaskFilters.jsx # Search and filter controls
│   ├── LoadingSpinner.jsx
│   └── ErrorBoundary.jsx
├── pages/              # Route components
│   └── TasksPage.jsx   # Main tasks page
├── services/           # API integration
│   └── taskApi.js      # Task API client
├── store/              # State management
│   └── TaskStore.jsx   # Zustand task store
├── test/               # Test utilities
│   └── setup.js        # Test configuration
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles and design tokens
```

## API Integration

The frontend communicates with a REST API running on port 3002. The API contract is defined in `/shared/contracts/task-management-api.yaml`.

### API Endpoints

- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Component Architecture

### State Management

The app uses Zustand for simple, efficient state management:

- Global task collection
- Loading and error states
- Filter state (search, status, priority)
- Optimistic updates for better UX

### Key Components

- **TaskList**: Displays filtered tasks with empty states
- **TaskItem**: Individual task with status toggle, edit, and delete
- **TaskForm**: Modal form for creating/editing tasks with validation
- **TaskFilters**: Search bar and dropdown filters with active filter display

### Design System

Custom CSS utility classes built on Tailwind:
- `.btn`, `.btn-primary`, `.btn-secondary` for consistent buttons
- `.form-input`, `.form-select` for form controls  
- `.card`, `.task-item` for content containers
- CSS custom properties for design tokens

## Testing Strategy

- Component tests with React Testing Library
- API service tests with mocked fetch
- Accessibility testing with jest-dom matchers
- User interaction testing with user-event

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting with React.lazy (ready for route-based splitting)
- Optimistic updates reduce perceived loading times
- Efficient re-renders with Zustand subscriptions
- Minimal bundle size with tree shaking