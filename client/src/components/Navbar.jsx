import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CITIES = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, quickDemoLogin, quickAdminLogin, selectedCity, changeCity } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    const res = await quickDemoLogin();
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleAdminLogin = async () => {
    const res = await quickAdminLogin();
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark glass-nav sticky-top py-2 py-lg-3">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-3" to="/">
          <div
            className="d-flex align-items-center justify-content-center bg-danger text-white rounded-3 shadow"
            style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #e50914, #ff334b)' }}
          >
            <i className="bi bi-film fs-5"></i>
          </div>
          <div>
            <span className="brand-font fw-bold fs-4 text-white">
              I<span className="text-danger">Movies</span>
            </span>
            <span className="d-none d-md-block text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Pan-India Movie Booking
            </span>
          </div>
        </Link>

        {/* City Location Picker (BookMyShow style) */}
        <div className="dropdown me-auto d-none d-sm-block">
          <button
            className="btn btn-dark btn-sm rounded-pill px-3 py-1 border border-secondary border-opacity-50 dropdown-toggle d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-geo-alt-fill text-danger"></i>
            <span className="text-white fw-semibold small">{selectedCity}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-dark shadow-lg border-secondary py-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <li className="px-3 py-1 text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
              Select Popular City
            </li>
            {CITIES.map((c) => (
              <li key={c}>
                <button
                  className={`dropdown-item small py-2 d-flex justify-content-between align-items-center ${c === selectedCity ? 'text-warning fw-bold' : ''}`}
                  onClick={() => changeCity(c)}
                >
                  <span>{c}</span>
                  {c === selectedCity && <i className="bi bi-check2 text-warning"></i>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#imoviesNavbar"
          aria-controls="imoviesNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="imoviesNavbar">
          <ul className="navbar-nav ms-lg-3 me-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <Link className="nav-link text-white-50 px-3 fw-medium" to="/">
                <i className="bi bi-compass me-1"></i> Movies
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50 px-3 fw-medium" href="/#browse-section">
                <i className="bi bi-fire me-1 text-warning"></i> Now Showing
              </a>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link text-white-50 px-3 fw-medium" to="/dashboard">
                  <i className="bi bi-ticket-perforated me-1 text-danger"></i> My Tickets
                </Link>
              </li>
            )}
            {/* Admin Portal Tab */}
            <li className="nav-item">
              <Link
                className={`nav-link px-3 fw-semibold d-flex align-items-center gap-1 ${
                  isAdmin ? 'text-warning' : 'text-white-50'
                }`}
                to="/admin"
              >
                <i className="bi bi-shield-check text-warning"></i> Admin Panel
                {isAdmin && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>Active</span>}
              </Link>
            </li>
          </ul>

          {/* User actions */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-cinema d-flex align-items-center gap-2 px-3 py-1 py-lg-2 dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="rounded-circle border border-warning"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                  <div className="text-start">
                    <span className="fw-semibold text-light d-block" style={{ fontSize: '0.85rem' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="badge bg-secondary text-light" style={{ fontSize: '0.6rem' }}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary">
                  <li className="px-3 py-2 border-bottom border-secondary">
                    <p className="mb-0 fw-bold text-white small">{user?.name}</p>
                    <p className="mb-0 text-white-50 small" style={{ fontSize: '0.75rem' }}>{user?.email}</p>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/dashboard">
                      <i className="bi bi-ticket-detailed me-2 text-warning"></i> My Tickets
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item py-2 text-warning fw-semibold" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Cinema Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider border-secondary" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item py-2 text-danger"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                {/* 1-click User Demo */}
                <button
                  onClick={handleDemoLogin}
                  className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1 px-3 py-2 fw-semibold"
                  title="Log in as Customer"
                >
                  <i className="bi bi-person-fill"></i> Demo User
                </button>

                {/* 1-click Admin Demo */}
                <button
                  onClick={handleAdminLogin}
                  className="btn btn-warning btn-sm d-flex align-items-center gap-1 px-3 py-2 fw-bold text-dark shadow-sm"
                  title="Open Admin Panel"
                >
                  <i className="bi bi-shield-lock-fill"></i> Demo Admin
                </button>

                <Link to="/login" className="btn btn-outline-cinema btn-sm px-3 py-2">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
