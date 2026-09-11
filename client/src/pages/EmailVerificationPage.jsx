import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in URL');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Your institutional email address has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed or token expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <div>
            <RefreshCw size={44} color="#315C45" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Verifying Email Token...</h2>
            <p style={{ color: '#68736E', marginTop: '0.5rem' }}>Please wait while we confirm your credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle2 size={54} color="#3F8F63" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#24312C' }}>Verification Complete</h2>
            <p style={{ color: '#68736E', margin: '0.75rem 0 1.5rem 0' }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle size={54} color="#C95C5C" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#C95C5C' }}>Verification Failed</h2>
            <p style={{ color: '#68736E', margin: '0.75rem 0 1.5rem 0' }}>{message}</p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
