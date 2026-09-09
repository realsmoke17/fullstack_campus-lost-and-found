import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const VerificationScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage('');
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email resent! Please check your inbox.');
    } catch (error) {
      console.error("Error resending verification email:", error);
      setMessage('Failed to resend email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        <div className="emoji-icon">📧</div>
        <h2>Verify Your Email</h2>
        <p className="auth-page__subtitle">
          We've sent a verification link to <strong>{user?.email}</strong>.<br />
          Please click the link in the email to activate your account and start using the board.
        </p>

        {message && (
          <div className={`status-message ${message.includes('Failed') ? 'status-message--error' : 'status-message--success'}`}>
            {message}
          </div>
        )}

        <button
          className="btn btn-primary btn--full-width"
          onClick={handleResendVerification}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
    </div>
  );
};

export default VerificationScreen;
