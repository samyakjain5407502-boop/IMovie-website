import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto pt-5 pb-4 border-top border-dark-subtle bg-black text-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center bg-danger text-white rounded-3"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-film fs-5"></i>
              </div>
              <span className="brand-font fw-bold fs-4 text-white">
                I<span className="text-danger">Movies</span>
              </span>
            </div>
            <p className="small text-secondary mb-3">
              Movie ticket booking made simple. Discover the latest blockbuster releases, select prime theater seats in real time, and enjoy unforgettable cinematic moments.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-secondary hover-text-white fs-5"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 small">Explore</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none">Now Showing</Link></li>
              <li><Link to="/" className="text-secondary text-decoration-none">Coming Soon</Link></li>
              <li><Link to="/" className="text-secondary text-decoration-none">Cinemas & IMAX</Link></li>
              <li><Link to="/dashboard" className="text-secondary text-decoration-none">My Bookings</Link></li>
            </ul>
          </div>

          {/* Cinema formats */}
          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 small">Experiences</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><span className="text-secondary">IMAX Laser 3D</span></li>
              <li><span className="text-secondary">Dolby Atmos Surround</span></li>
              <li><span className="text-secondary">4DX Motion & Effects</span></li>
              <li><span className="text-secondary">VIP Recliner Lounges</span></li>
            </ul>
          </div>

          {/* Tech stack badge */}
          <div className="col-lg-3 col-md-12">
            <h6 className="text-white fw-bold text-uppercase mb-3 small">Architecture</h6>
            <p className="small text-secondary mb-2">
              Full-Stack MERN Architecture powered by MongoDB Mongoose, Express.js REST API, React.js 18, and Node.js.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-dark border border-secondary text-light">MongoDB</span>
              <span className="badge bg-dark border border-secondary text-light">Express.js</span>
              <span className="badge bg-dark border border-secondary text-light">React.js</span>
              <span className="badge bg-dark border border-secondary text-light">Node.js</span>
              <span className="badge bg-dark border border-secondary text-light">JWT Auth</span>
            </div>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <span>&copy; {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</span>
          <span>Crafted for cinema lovers with real-time seat tracking.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

