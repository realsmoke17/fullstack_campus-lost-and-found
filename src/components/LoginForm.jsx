import React, { useState, useEffect } from 'react';
import { signUp, logIn, resetPassword } from '../firebase/auth';
import { getBoardStats } from '../firebase/firestore';

const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchTeaserStats = async () => {
      const data = await getBoardStats();
      setStats(data);
    };
    fetchTeaserStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await logIn(studentNumber, password);
      } else {
        await signUp(studentNumber, password, username);
        alert('Account created! Please check your TUT4life email to verify your account.');
      }
      onLogin();
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!studentNumber) {
      setError('Please enter your student number first.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(studentNumber);
      alert('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        {/* Public Teaser */}
        {stats && (
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px dashed #cbd5e0',
            color: '#4a5568'
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>Campus Activity</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>{stats.totalItems}</strong> items posted —
              <span style={{ color: '#e53e3e' }}> {stats.lostCount} lost</span>,
              <span style={{ color: '#38a169' }}> {stats.foundCount} found</span>
            </p>
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Log In
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>

        <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          {isLogin ? 'Please enter your details to continue.' : 'Join the community and help find lost items!'}
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fdecea',
            color: '#d32f2f',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #ef9a9a'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
              />
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Student Number</label>
            <input
              type="text"
              className="form-input"
              required
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="1234567"
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
