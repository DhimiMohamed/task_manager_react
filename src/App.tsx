import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import VerifyEmailPage from './components/VerifyEmailPage';
import EmailVerifiedSuccess from './components/EmailVerifiedSuccess';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
// import Tasks from './components/Test';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/sidebar';
import CalendarPage from './pages/CalendarPage';
import NewTaskPage from './pages/NewTaskPage';
import CategoriesPage from './pages/CategoriesPage';
import TasksPage from './pages/TasksPage';
import AIAssistantToggle from './components/ai-assistant-toggle';
import NotificationsPage from './pages/NotificationsPage';
import StatisticsPage from './pages/StatisticsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verified" element={<EmailVerifiedSuccess />} />
        {/* ... other public routes */}

        {/* Protected area with wildcard */}
        <Route path="/*" element={
          <ProtectedRoute>
            <LayoutWithSidebar />
          </ProtectedRoute>
        }>
          {/* Nested protected routes */}
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          {/* <Route path="calendar" element={<CalendarPage />} /> */}
          {/* <Route path="tasks" element={<Tasks />} /> */}
          {/* <Route index element={<Dashboard />} />  */}
          {/* Default route */}
        </Route>

        {/* 404 handling */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

function LayoutWithSidebar() {
  return (
    <div className="flex h-screen">
      
      <Sidebar />
      <main className="flex-1 overflow-auto p-2 md:p-6 pt-16 md:pt-6">
      {/* <main className="flex-1 p-2 md:p-6 pt-16 md:pt-6"> */}
        <Routes>
          {/* These will render in the main content area */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          {/* <Route path="tasks" element={<Tasks />} /> */}
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/new" element={<NewTaskPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Routes>
      </main>
      <AIAssistantToggle/>
    </div>
  );
}

export default App;