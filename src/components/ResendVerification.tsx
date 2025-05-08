import React, { useState, useEffect } from 'react';
import { AccountsApi } from '../api/apis/accounts-api';
import { AccountsResendVerificationCreateRequest } from '../api/models/accounts-resend-verification-create-request';
import './ResendVerification.css';

interface ResendVerificationProps {
  defaultEmail?: string;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ defaultEmail = '' }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [cooldown, setCooldown] = useState(0); // New cooldown state

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const api = new AccountsApi();
      const request: AccountsResendVerificationCreateRequest = { email };
      await api.accountsResendVerificationCreate(request);
      setMessage({
        text: 'Verification email resent. Please check your inbox.',
        type: 'success'
      });
      setCooldown(60); // Start 60-second cooldown
    } catch (err) {
      setMessage({
        text: 'Failed to resend verification email. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resend-verification-container">
      <div className="resend-verification-card">
        <h3 className="resend-title">Resend Verification Email</h3>
        <form onSubmit={handleSubmit} className="resend-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="email-input"
              disabled={cooldown > 0} // Disable during cooldown
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || cooldown > 0}
            className={`resend-button ${isLoading ? 'loading' : ''} ${cooldown > 0 ? 'cooldown' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              'Resend Email'
            )}
          </button>
        </form>
        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}
        {cooldown > 0 && (
          <div className="cooldown-message">
            You can request another email in {cooldown} seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;