import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const { user, isAdmin, quickAdminLogin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, movies, showtimes, bookings
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Movie Form Modal State
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    genre: 'Action, Thriller',
    duration: 150,
    rating: 8.5,
    certification: 'UA',
    language: 'Hindi',
    director: '',
    featured: false,
  });

  // New Showtime Form Modal State
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    theaterName: 'PVR INOX Gold: Phoenix Mall, Lower Parel (Mumbai)',
    screen: 'Screen 1 (IMAX Laser)',
    date: new Date().toISOString().split('T')[0],
    time: '07:30 PM',
    format: 'IMAX 3D',
    pricing: { standard: 180, premium: 250, vip: 380 },
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, showtimesRes, bookingsRes] = await Promise.all([
        API.get('/bookings/admin/stats'),
        API.get('/movies'),
        API.get('/showtimes/admin/all'),
        API.get('/bookings/admin/all'),
      ]);

      setStats(statsRes.data.data);
      setMovies(moviesRes.data.data || []);
      setShowtimes(showtimesRes.data.data || []);
      setAllBookings(bookingsRes.data.data || []);

      if (moviesRes.data.data?.length > 0) {
        setShowtimeForm((prev) => ({ ...prev, movieId: moviesRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Movie Handlers
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
      };
      const res = await API.post('/movies', payload);
      setMovies([res.data.data, ...movies]);
      setShowMovieModal(false);
      setMovieForm({
        title: '',
        description: '',
        posterUrl: '',
        backdropUrl: '',
        trailerUrl: '',
        genre: 'Action, Thriller',
        duration: 150,
        rating: 8.5,
        certification: 'UA',
        language: 'Hindi',
        director: '',
        featured: false,
      });
      alert('Movie added to catalog successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add movie');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await API.delete(`/movies/${id}`);
      setMovies(movies.filter((m) => m._id !== id));
    } catch (err) {
      alert('Failed to delete movie');
    }
  };

  // Showtime Handlers
  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await API.post('/showtimes', showtimeForm);
      setShowtimes([res.data.data, ...showtimes]);
      setShowShowtimeModal(false);
      alert('Showtime scheduled successfully!');
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule showtime');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Are you sure you want to remove this showtime?')) return;
    try {
      await API.delete(`/showtimes/${id}`);
      setShowtimes(showtimes.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to delete showtime');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center my-auto">
        <div className="glass-card p-5 mx-auto shadow-lg" style={{ maxWidth: '500px' }}>
          <div className="text-warning fs-1 mb-3">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h3 className="text-white fw-bold brand-font mb-2">Admin Portal Restricted</h3>
          <p className="text-secondary small mb-4">
            You need Cinema Manager privileges to access analytics, movie listings, and showtime schedules.
          </p>
          <button
            onClick={quickAdminLogin}
            className="btn btn-warning w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
          >
            <i className="bi bi-lightning-charge-fill"></i> 1-Click Login as Cinema Admin
          </button>
          <div className="mt-3">
            <Link to="/" className="text-secondary small text-decoration-none">
              ← Back to Cinema Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 pb-5">
      {/* Admin Top Header */}
      <div className="glass-card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger px-3 py-1 fw-bold text-uppercase">
                <i className="bi bi-shield-shaded me-1"></i> Control Center
              </span>
              <span className="badge bg-dark border border-warning text-warning">
                Manager: {user?.name}
              </span>
            </div>
            <h2 className="text-white fw-bold brand-font mb-0">IMovies Cinema Admin Panel</h2>
            <p className="text-secondary small mb-0">
              Manage multi-lingual releases, screen auditorium schedules, and track ticket revenues.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={() => setShowMovieModal(true)}
              className="btn btn-cinema btn-sm d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle-fill"></i> Add Movie
            </button>
            <button
              onClick={() => setShowShowtimeModal(true)}
              className="btn btn-accent btn-sm d-flex align-items-center gap-2"
            >
              <i className="bi bi-calendar-plus-fill"></i> Schedule Showtime
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <ul className="nav nav-pills glass-card p-2 mb-4 d-flex gap-2 border border-secondary border-opacity-25">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold rounded-3 px-3 py-2 ${activeTab === 'overview' ? 'active bg-danger text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-1"></i> Dashboard & Analytics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold rounded-3 px-3 py-2 ${activeTab === 'movies' ? 'active bg-danger text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('movies')}
          >
            <i className="bi bi-film me-1"></i> Movie Catalog ({movies.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold rounded-3 px-3 py-2 ${activeTab === 'showtimes' ? 'active bg-danger text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('showtimes')}
          >
            <i className="bi bi-clock-history me-1"></i> Showtimes ({showtimes.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold rounded-3 px-3 py-2 ${activeTab === 'bookings' ? 'active bg-danger text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-receipt me-1"></i> Reservations ({allBookings.length})
          </button>
        </li>
      </ul>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <div className="glass-card p-3 h-100 border-start border-4 border-success">
                <span className="text-secondary small d-block">Total Revenue</span>
                <h3 className="text-success fw-bold mb-0">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</h3>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>From confirmed ticket sales</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="glass-card p-3 h-100 border-start border-4 border-danger">
                <span className="text-secondary small d-block">Total Bookings</span>
                <h3 className="text-white fw-bold mb-0">{stats?.totalBookings || 0}</h3>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{stats?.confirmedBookings || 0} active confirmed</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="glass-card p-3 h-100 border-start border-4 border-warning">
                <span className="text-secondary small d-block">Active Releases</span>
                <h3 className="text-warning fw-bold mb-0">{stats?.totalMovies || movies.length}</h3>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Bollywood, South & Hollywood</span>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="glass-card p-3 h-100 border-start border-4 border-info">
                <span className="text-secondary small d-block">Scheduled Shows</span>
                <h3 className="text-info fw-bold mb-0">{stats?.totalShowtimes || showtimes.length}</h3>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Across IMAX, 4DX & Atmos</span>
              </div>
            </div>
          </div>

          {/* Recent Reservations Table */}
          <div className="glass-card p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-clock text-danger"></i> Recent Customer Bookings
            </h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>Ticket Ref</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id}>
                      <td><span className="badge bg-dark border border-secondary text-warning">{b.bookingReference}</span></td>
                      <td className="fw-semibold text-white">{b.userId?.name || 'Guest User'}</td>
                      <td>{b.movieId?.title}</td>
                      <td><span className="badge bg-secondary">{b.seats?.join(', ')}</span></td>
                      <td className="text-success fw-bold">₹{b.totalAmount}</td>
                      <td>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movies Catalog */}
      {activeTab === 'movies' && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Movie Catalog ({movies.length})</h5>
            <button onClick={() => setShowMovieModal(true)} className="btn btn-cinema btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Add New Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Language</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td style={{ width: '60px' }}>
                      <img src={m.posterUrl} alt={m.title} className="rounded-2" style={{ width: '45px', height: '60px', objectFit: 'cover' }} />
                    </td>
                    <td>
                      <strong className="text-white d-block">{m.title}</strong>
                      <span className="text-secondary small">{m.director}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-light border border-secondary border-opacity-25">
                        {m.language}
                      </span>
                    </td>
                    <td><span className="text-secondary small">{m.genre?.join(', ')}</span></td>
                    <td>{Math.floor(m.duration / 60)}h {m.duration % 60}m</td>
                    <td><span className="text-warning fw-bold"><i className="bi bi-star-fill me-1"></i>{m.rating}</span></td>
                    <td>
                      <button
                        onClick={() => handleDeleteMovie(m._id, m.title)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete movie"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Showtime Manager */}
      {activeTab === 'showtimes' && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Scheduled Auditorium Showtimes ({showtimes.length})</h5>
            <button onClick={() => setShowShowtimeModal(true)} className="btn btn-accent btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Schedule Showtime
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Movie</th>
                  <th>Theater & Screen</th>
                  <th>Date & Time</th>
                  <th>Format</th>
                  <th>Seats Left</th>
                  <th>Pricing</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <strong className="text-white">{st.movieId?.title}</strong>
                      <span className="badge bg-dark text-secondary ms-2">{st.movieId?.language}</span>
                    </td>
                    <td>
                      <div className="text-light small">{st.theaterName}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{st.screen}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-white">{st.time}</div>
                      <div className="text-secondary small">{st.date}</div>
                    </td>
                    <td><span className="badge bg-danger-subtle text-danger">{st.format}</span></td>
                    <td>
                      <span className="badge bg-success-subtle text-success">
                        {st.availableSeatsCount} / {st.totalSeats}
                      </span>
                    </td>
                    <td className="small text-secondary">
                      ₹{st.pricing?.standard} / ₹{st.pricing?.premium} / ₹{st.pricing?.vip}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteShowtime(st._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Remove showtime"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Reservations Table */}
      {activeTab === 'bookings' && (
        <div className="glass-card p-4">
          <h5 className="text-white fw-bold mb-4">Customer Reservations ({allBookings.length})</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Reference</th>
                  <th>User Details</th>
                  <th>Movie</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b._id}>
                    <td><span className="badge bg-dark border border-warning text-warning fw-mono">{b.bookingReference}</span></td>
                    <td>
                      <div className="fw-bold text-white">{b.userId?.name || 'User'}</div>
                      <div className="text-secondary small">{b.userId?.email}</div>
                    </td>
                    <td>{b.movieId?.title}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {b.seats?.map((s) => (
                          <span key={s} className="badge bg-secondary small">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-success fw-bold">₹{b.totalAmount}</td>
                    <td className="small text-secondary">{b.paymentMethod}</td>
                    <td>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showMovieModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content glass-card border-secondary text-light">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white">Add New Movie Release</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMovieModal(false)}></button>
              </div>
              <form onSubmit={handleCreateMovie}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-secondary">Movie Title</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                        placeholder="e.g. Pushpa 2: The Rule"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary">Language Industry</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={movieForm.language}
                        onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                      >
                        <option value="Hindi">Hindi (Bollywood)</option>
                        <option value="Telugu">Telugu (Tollywood)</option>
                        <option value="Tamil">Tamil (Kollywood)</option>
                        <option value="Malayalam">Malayalam (Mollywood)</option>
                        <option value="Kannada">Kannada (Sandalwood)</option>
                        <option value="English">English (Hollywood)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary">Synopsis / Description</label>
                      <textarea
                        required
                        rows="3"
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Poster URL</label>
                      <input
                        type="url"
                        required
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Backdrop URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.backdropUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, backdropUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary">Genres (comma separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.genre}
                        onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small text-secondary">Runtime (min)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small text-secondary">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control bg-dark border-secondary text-white"
                        value={movieForm.rating}
                        onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small text-secondary">Cert</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={movieForm.certification}
                        onChange={(e) => setMovieForm({ ...movieForm, certification: e.target.value })}
                      >
                        <option value="U">U</option>
                        <option value="UA">UA</option>
                        <option value="A">A</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small text-secondary">Featured</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={movieForm.featured}
                          onChange={(e) => setMovieForm({ ...movieForm, featured: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-outline-cinema" onClick={() => setShowMovieModal(false)}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn btn-cinema">
                    {actionLoading ? 'Saving...' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Showtime Modal */}
      {showShowtimeModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-secondary text-light">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white">Schedule New Showtime</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowShowtimeModal(false)}></button>
              </div>
              <form onSubmit={handleCreateShowtime}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Movie</label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      value={showtimeForm.movieId}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Theater Name</label>
                    <input
                      type="text"
                      required
                      className="form-control bg-dark border-secondary text-white"
                      value={showtimeForm.theaterName}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, theaterName: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Auditorium / Screen</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.screen}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, screen: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Format</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={showtimeForm.format}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value })}
                      >
                        <option value="IMAX 3D">IMAX 3D</option>
                        <option value="4DX">4DX Motion</option>
                        <option value="2D">Dolby 2D</option>
                        <option value="3D">RealD 3D</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Show Date</label>
                      <input
                        type="date"
                        required
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.date}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Show Time</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.time}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                        placeholder="e.g. 07:45 PM"
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-4">
                      <label className="form-label small text-secondary">Standard (₹)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.pricing.standard}
                        onChange={(e) => setShowtimeForm({
                          ...showtimeForm,
                          pricing: { ...showtimeForm.pricing, standard: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-secondary">Premium (₹)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.pricing.premium}
                        onChange={(e) => setShowtimeForm({
                          ...showtimeForm,
                          pricing: { ...showtimeForm.pricing, premium: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-secondary">VIP (₹)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white"
                        value={showtimeForm.pricing.vip}
                        onChange={(e) => setShowtimeForm({
                          ...showtimeForm,
                          pricing: { ...showtimeForm.pricing, vip: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-outline-cinema" onClick={() => setShowShowtimeModal(false)}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn btn-accent">
                    {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

