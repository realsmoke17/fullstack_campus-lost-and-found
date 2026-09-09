import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logOut } from '../firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
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
          <Link to="/board" className="nav-link">Browse</Link>
          <Link to="/post" className="nav-link">Post Item</Link>
          <button className="nav-link" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
