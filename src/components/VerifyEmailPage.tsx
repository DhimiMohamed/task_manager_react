// src/components/VerifyEmailPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountsApi } from '../api/apis/accounts-api';
import ResendVerification from './ResendVerification';
import { Navigate } from 'react-router-dom';


const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const userId = Number(searchParams.get('user_id'));
        const token = searchParams.get('token');
        
        if (!userId || !token) {
          throw new Error('Invalid verification link');
        }

        const api = new AccountsApi();
        await api.accountsVerifyRead(userId, token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (status === 'verifying') {
    return <div>Verifying your email...</div>;
  }

  if (status === 'success') {
    return <Navigate to="/email-verified" replace />;
  }

  return (
    <div className="verification-error">
      <h2>Verification Failed</h2>
      <p>{error}</p>
      <ResendVerification />
    </div>
  );
};

export default VerifyEmailPage;