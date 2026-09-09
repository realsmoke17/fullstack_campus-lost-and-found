import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBoardStats } from "../firebase/firestore";

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const boardStats = await getBoardStats();
      setStats(boardStats);
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      <div className="landing-page">
        <section className="landing-hero">
          <h1 className="landing-hero__title">Campus Lost & Found</h1>
          <p className="landing-hero__subtitle">
            Help your fellow students find their missing belongings. Post lost
            items, report found ones, and reunite people with their stuff.
          </p>
        </section>

        {stats && (
          <section className="stats-teaser">
            <h4 className="stats-teaser__title">Campus Activity</h4>
            <p className="stats-teaser__text">
              <strong>{stats.totalItems}</strong> items posted —{" "}
              <span className="stats-teaser__lost">{stats.lostCount} lost</span>,{" "}
              <span className="stats-teaser__found">{stats.foundCount} found</span>
            </p>
          </section>
        )}

        <section className="landing-cta">
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Get Started
          </button>
          <p className="landing-cta__link">
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
              Log In
            </a>
          </p>
        </section>

        <section className="landing-features">
          <div className="landing-features__card">
            <div className="emoji-icon">📸</div>
            <h3>Post Items</h3>
            <p>Upload photos and details of lost or found items on campus.</p>
          </div>
          <div className="landing-features__card">
            <div className="emoji-icon">🔍</div>
            <h3>Search & Filter</h3>
            <p>Easily find what you're looking for with powerful search and category filters.</p>
          </div>
          <div className="landing-features__card">
            <div className="emoji-icon">✅</div>
            <h3>Mark as Resolved</h3>
            <p>Keep the board clean by resolving items once they've been claimed.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
