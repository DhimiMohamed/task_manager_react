
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import VerifyEmailPage from './components/VerifyEmailPage'; // <-- ADD THIS
import EmailVerifiedSuccess from './components/EmailVerifiedSuccess';
import LoginForm from './components/LoginForm';
import Test from './components/Test'; 
import ProtectedRoute from './routes/ProtectedRoute'; 


function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route path="/register" element={<RegistrationForm />} />
        
        {/* NEW ROUTE - Add this line exactly as shown */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/email-verified" element={<EmailVerifiedSuccess />} />

        <Route path="/login" element={<LoginForm />} />

        {/* ✅ Protect the /tasks route */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}
export default App