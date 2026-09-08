import React from 'react';

const Navbar = ({ currentScreen, setScreen }) => {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="nav-logo" onClick={() => setScreen('board')}>
          Campus Lost & Found
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => setScreen('board')}>Browse</button>
          <button className="nav-link" onClick={() => setScreen('post')}>Post Item</button>
          <button className="nav-link" onClick={() => setScreen('auth')}>Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
