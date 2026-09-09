import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound displays a user-friendly 404 page instead of silently redirecting.
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="not-found-page">
        <div className="emoji-icon">🔍</div>
        <h2>Page Not Found</h2>
        <p className="auth-page__subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/board')}>
          Go to Board
        </button>
      </div>
    </div>
  );
};

export default NotFound;

