import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="nav-logo" onClick={() => navigate('/board')} style={{ cursor: 'pointer' }}>
          Campus Lost & Found
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/board" className="nav-link">Browse</Link>
              <Link to="/post" className="nav-link">Post Item</Link>
              <Link to="/my-items" className="nav-link">My Items</Link>
              <button className="nav-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Log In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
