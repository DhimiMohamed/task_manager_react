// src/components/EmailVerifiedSuccess.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmailVerifiedSuccess.css'; // We'll create this next

const EmailVerifiedSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login'); // Redirect after 5 seconds
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="verification-success-container">
      <div className="verification-success-card">
        <div className="success-icon">✓</div>
        <h1>Email Verified Successfully!</h1>
        <p>Your account is now fully activated. You'll be redirected to login shortly.</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <button 
          className="login-now-button"
          onClick={() => navigate('/login')}
        >
          Log In Now
        </button>
      </div>
    </div>
  );
};

export default EmailVerifiedSuccess;