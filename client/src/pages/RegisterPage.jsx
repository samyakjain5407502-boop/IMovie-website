import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const res = await register(name, email, password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-sm-5 shadow-lg">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-3 mb-2 shadow"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-film fs-4"></i>
              </div>
              <h3 className="fw-bold text-white brand-font">Join IMovies</h3>
              <p className="text-secondary small">
                Create your account to unlock seamless movie bookings & real-time seat reservations.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    required
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    required
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-cinema w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span> Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus"></i> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25 small text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-semibold text-decoration-none">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

