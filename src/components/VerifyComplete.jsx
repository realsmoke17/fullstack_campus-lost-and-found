import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmailWithCode } from '../firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const VerifyComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get('oobCode');

      if (!oobCode) {
        setStatus('error');
        setErrorMsg('Invalid or missing verification code.');
        return;
      }

      try {
        // 1. Apply the action code from the email
        await verifyEmailWithCode(oobCode);

        // 2. Refresh the current user to update emailVerified flag
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        setStatus('success');

        // 3. Redirect to intended page or board
        setTimeout(() => {
          const destination = location.state?.from || '/board';
          navigate(destination, { replace: true });
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        setErrorMsg(error.message || 'Failed to verify email. The link may have expired.');
      }
    };

    verify();
  }, [navigate, location]);

  return (
    <div className="container">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
            <h2>Verifying Your Account...</h2>
            <p>Please wait a moment while we confirm your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
            <h2>Email Verified!</h2>
            <p>Your account is now active. Redirecting you to the board...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
            <h2>Verification Failed</h2>
            <p style={{ color: '#d32f2f' }}>{errorMsg}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/verify')}
              style={{ marginTop: '20px' }}
            >
              Go Back to Verification Screen
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyComplete;
