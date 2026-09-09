import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const VerificationScreen = ({ user }) => {
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
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📧</div>
        <h2>Verify Your Email</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          We've sent a verification link to <strong>{user?.email}</strong>.<br />
          Please click the link in the email to activate your account and start using the board.
        </p>

        {message && (
          <div style={{
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            backgroundColor: message.includes('Failed') ? '#fdecea' : '#e8f5e9',
            color: message.includes('Failed') ? '#d32f2f' : '#2e7d32',
            border: `1px solid ${message.includes('Failed') ? '#ef9a9a' : '#c8e6c9'}`
          }}>
            {message}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '300px' }}
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
