import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import TasksPage from './pages/TasksPage'
import { TaskProvider } from './store/TaskStore'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Routes>  
        </Layout>
      </TaskProvider>
    </ErrorBoundary>
  )
}

export default App