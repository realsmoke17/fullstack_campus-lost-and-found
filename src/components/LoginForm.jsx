import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUp, logIn, resetPassword } from '../firebase/auth';
import { getBoardStats } from '../firebase/firestore';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [studentNumError, setStudentNumError] = useState('');

  useEffect(() => {
    const fetchTeaserStats = async () => {
      const data = await getBoardStats();
      setStats(data);
    };
    fetchTeaserStats();
  }, []);

  const handleStudentNumberChange = (e) => {
    const val = e.target.value;
    setStudentNumber(val);
    if (val && val.length < 5) {
      setStudentNumError('Student number must be at least 5 digits.');
    } else {
      setStudentNumError('');
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return '';
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;

    if (strength === 1) return 'weak';
    if (strength === 2) return 'medium';
    if (strength === 3) return 'strong';
    return 'weak';
  };

  const passwordStrength = !isLogin ? getPasswordStrength(password) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (studentNumber.length < 5) {
      setError('Student number must be at least 5 digits.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await logIn(studentNumber, password);
      } else {
        await signUp(studentNumber, password, username);
        alert('Account created! Please check your TUT4life email to verify your account.');
      }

      const destination = location.state?.from || '/board';
      navigate(destination, { replace: true });
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
          <div className="stats-teaser">
            <h4 className="stats-teaser__title">Campus Activity</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>{stats.totalItems}</strong> items posted —
              <span className="stats-teaser__lost"> {stats.lostCount} lost</span>,
              <span className="stats-teaser__found"> {stats.foundCount} found</span>
            </p>
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setStudentNumError('');
            }}
          >
            Log In
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setStudentNumError('');
            }}
          >
            Sign Up
          </button>
        </div>

        <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
        <p className="auth-page__subtitle">
          {isLogin ? 'Please enter your details to continue.' : 'Join the community and help find lost items!'}
        </p>

        {error && (
          <div className="error-alert">
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
              onChange={handleStudentNumberChange}
              placeholder="1234567"
            />
            {studentNumError && (
              <div style={{ color: '#d32f2f', fontSize: '0.8rem', marginTop: '5px' }}>{studentNumError}</div>
            )}
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
            {!isLogin && password && (
              <div className="password-strength">
                <div className={`password-strength__bar password-strength__bar--${passwordStrength}`}></div>
                <div className="password-strength__text">Strength: {passwordStrength}</div>
              </div>
            )}
          </div>

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading || !!studentNumError}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
