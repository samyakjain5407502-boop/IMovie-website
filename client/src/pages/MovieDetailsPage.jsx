import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── FORMAT BADGE CONFIG ─────────────────────────────────────────────────────
const FORMAT_CONFIG = {
  '2D':           { color: '#6c757d', bg: '#343a40',  icon: '🎬', label: '2D'           },
  '3D':           { color: '#0dcaf0', bg: '#0d3040',  icon: '🥽', label: '3D'           },
  'RealD 3D':     { color: '#0dcaf0', bg: '#0d3040',  icon: '🥽', label: 'RealD 3D'     },
  'IMAX 3D':      { color: '#fff',    bg: '#000',     icon: '🔭', label: 'IMAX 3D'      },
  'IMAX Laser':   { color: '#fff',    bg: '#000',     icon: '🔭', label: 'IMAX LASER'   },
  'Dolby Atmos':  { color: '#fff',    bg: '#1a1a2e',  icon: '🔊', label: 'DOLBY ATMOS'  },
  'Dolby Cinema': { color: '#ff6b35', bg: '#1a0a00',  icon: '🎭', label: 'DOLBY CINEMA' },
  '4DX':          { color: '#ffd700', bg: '#1a1400',  icon: '💥', label: '4DX'          },
  '4DX 3D':       { color: '#ffd700', bg: '#1a1400',  icon: '💥', label: '4DX 3D'       },
  'ScreenX':      { color: '#9b59b6', bg: '#1a0d2e',  icon: '📽️', label: 'ScreenX'      },
  '4K HDR':       { color: '#2ecc71', bg: '#0d2015',  icon: '🌟', label: '4K HDR'       },
};

const FORMAT_PRICES_DISPLAY = {
  '2D':           'Budget ₹140 | Premium ₹240 | Recliner ₹380',
  '3D':           'Budget ₹170 | Premium ₹280 | Recliner ₹450',
  'RealD 3D':     'Budget ₹190 | Premium ₹300 | Recliner ₹470',
  'IMAX 3D':      'Budget ₹280 | Premium ₹400 | Recliner ₹600',
  'IMAX Laser':   'Budget ₹320 | Premium ₹450 | Recliner ₹650',
  'Dolby Atmos':  'Budget ₹220 | Premium ₹340 | Recliner ₹500',
  'Dolby Cinema': 'Budget ₹260 | Premium ₹380 | Recliner ₹550',
  '4DX':          'Budget ₹350 | Premium ₹480 | Recliner ₹700',
  '4DX 3D':       'Budget ₹380 | Premium ₹520 | Recliner ₹750',
  'ScreenX':      'Budget ₹300 | Premium ₹420 | Recliner ₹580',
  '4K HDR':       'Budget ₹200 | Premium ₹320 | Recliner ₹490',
};

const FormatBadge = ({ format, size = 'sm' }) => {
  const cfg = FORMAT_CONFIG[format] || FORMAT_CONFIG['2D'];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1.5px solid ${cfg.color}`,
        borderRadius: '6px',
        padding: size === 'lg' ? '4px 12px' : '2px 8px',
        fontSize: size === 'lg' ? '0.85rem' : '0.72rem',
        fontWeight: '700',
        letterSpacing: '0.03em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: size === 'lg' ? '1rem' : '0.75rem' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity: authCity, changeCity } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(authCity || 'Indore');
  const [selectedFormat, setSelectedFormat] = useState('All');

  // Keep in sync with auth city if changed from navbar
  useEffect(() => {
    if (authCity) {
      setSelectedCity(authCity);
    }
  }, [authCity]);

  // Helper to format dates
  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();

    let label = `${dayName}, ${monthName} ${dayNum}`;
    if (diffDays === 0) label = `Today, ${dayNum} ${monthName}`;
    if (diffDays === 1) label = `Tomorrow, ${dayNum} ${monthName}`;

    return { label, fullDate: dateStr, dayNum, dayName, monthName };
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const movieRes = await API.get(`/movies/${id}`);
      setMovie(movieRes.data.data);

      const showtimesRes = await API.get(`/showtimes/movie/${id}`);
      const stData = showtimesRes.data.data || [];
      setShowtimes(stData);

      const dates = Array.from(new Set(stData.map((s) => s.date))).sort();
      setAvailableDates(dates);

      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError('Could not load movie information or showtimes.');
    } finally {
      setLoading(false);
    }
  };

  // Filter showtimes for selected date
  const filteredShowtimes = showtimes.filter((s) => s.date === selectedDate);

  // Get unique cities and formats for filter
  const uniqueCities = Array.from(new Set(filteredShowtimes.map(s => s.city || 'Other').filter(Boolean)));
  const preferredOrder = ['Indore', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];
  const sortedCities = preferredOrder.filter(c => uniqueCities.includes(c));
  const otherCities = uniqueCities.filter(c => !preferredOrder.includes(c));
  const allCities = ['All', ...sortedCities, ...otherCities];
  const allFormats = ['All', ...Array.from(new Set(filteredShowtimes.map(s => s.format))).sort()];

  // Apply city + format filters
  const filteredByFilters = filteredShowtimes.filter(s => {
    const cityOk = selectedCity === 'All' || s.city === selectedCity;
    const fmtOk = selectedFormat === 'All' || s.format === selectedFormat;
    return cityOk && fmtOk;
  });

  // Group showtimes by theater+format
  const showtimesByTheater = filteredByFilters.reduce((acc, curr) => {
    const key = `${curr.cinemaName || curr.theaterName}||${curr.format}`;
    if (!acc[key]) {
      acc[key] = {
        theaterName: curr.cinemaName || curr.theaterName,
        location: curr.location,
        city: curr.city,
        screen: curr.screen,
        format: curr.format,
        times: [],
      };
    }
    acc[key].times.push(curr);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger p-4">
          <h4>{error || 'Movie Not Found'}</h4>
          <Link to="/" className="btn btn-outline-danger mt-3">
            <i className="bi bi-arrow-left me-1"></i> Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = movie.status === 'COMING_SOON'
    ? <span className="badge bg-warning text-dark px-3 py-1 fw-bold text-uppercase">Coming Soon</span>
    : <span className="badge bg-danger px-3 py-1 fw-bold text-uppercase">Now Showing</span>;

  return (
    <div className="pb-5">
      {/* Movie Hero Banner with Backdrop */}
      <section
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(11, 14, 20, 0.4) 0%, rgba(11, 14, 20, 0.95) 70%, #0b0e14 100%), url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="container position-relative py-4" style={{ zIndex: 2 }}>
          <div className="row g-4 align-items-center">
            {/* Poster column */}
            <div className="col-lg-3 col-md-4 col-sm-6 mx-auto text-center">
              <div className="movie-card shadow-lg mx-auto" style={{ maxWidth: '300px' }}>
                <div className="movie-poster-wrap">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="movie-poster-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="movie-rating-badge">
                    <i className="bi bi-star-fill text-warning me-1"></i> {movie.rating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="movie-cert-badge">{movie.certification}</div>
                </div>
              </div>
            </div>

            {/* Movie Info Details */}
            <div className="col-lg-9 col-md-8">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {statusBadge}
                <span className="badge bg-dark border border-secondary text-light px-3 py-1">
                  {movie.language}
                </span>
                <span className="badge bg-dark border border-secondary text-light px-3 py-1">
                  {movie.certification}
                </span>
              </div>

              <h1 className="display-4 fw-black text-white brand-font mb-2">
                {movie.title}
              </h1>

              {/* Stats & Meta info */}
              <div className="d-flex flex-wrap align-items-center gap-4 text-secondary mb-3">
                <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5">
                  <i className="bi bi-star-fill"></i>
                  <span>{movie.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-secondary small fw-normal">/ 10</span>
                </div>
                <div>
                  <i className="bi bi-clock me-1"></i>
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </div>
                <div>
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div>
                  <i className="bi bi-camera-reels me-1"></i>
                  Director: <strong className="text-light">{movie.director}</strong>
                </div>
              </div>

              {/* Genres */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre?.map((g) => (
                  <span key={g} className="badge bg-secondary-subtle border border-secondary border-opacity-50 text-light px-3 py-2 rounded-pill">
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <h6 className="text-white fw-bold text-uppercase mb-2 small text-secondary">Synopsis</h6>
              <p className="text-light text-opacity-90 lead mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                {movie.description}
              </p>

              {/* CTA anchor */}
              <div className="d-flex flex-wrap gap-3">
                {movie.status !== 'COMING_SOON' && (
                  <a href="#showtimes-section" className="btn btn-cinema btn-lg px-4 d-flex align-items-center gap-2">
                    <i className="bi bi-ticket-perforated-fill fs-5"></i> View Showtimes & Book Tickets
                  </a>
                )}
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-cinema btn-lg px-4 d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-play-circle fs-5 text-danger"></i> Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cast Section */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="container py-4">
          <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-people-fill text-danger"></i> Top Cast
          </h4>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
            {movie.cast.map((c, idx) => (
              <div className="col" key={idx}>
                <div className="glass-card p-3 text-center h-100">
                  <img
                    src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={c.name}
                    className="rounded-circle mb-2 border border-secondary"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                  />
                  <h6 className="text-white fw-bold mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>{c.name}</h6>
                  <p className="text-secondary small mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Showtimes & Theaters Section */}
      <section className="container py-4" id="showtimes-section">
        {movie.status === 'COMING_SOON' ? (
          <div className="glass-card p-5 text-center border-warning border-opacity-50">
            <div className="badge bg-warning text-dark fs-6 px-3 py-2 mb-3 fw-bold shadow">
              <i className="bi bi-rocket-takeoff-fill me-1"></i> UPCOMING CINEMATIC RELEASE
            </div>
            <h2 className="text-white fw-bold mb-2">Releasing Soon in IMovies Multiplexes!</h2>
            <p className="text-secondary lead mx-auto mb-4" style={{ maxWidth: '650px', fontSize: '1.05rem' }}>
              Advance ticket bookings for <strong className="text-white">{movie.title}</strong> will open shortly across all theaters in India. Watch the official teaser trailer below and get ready!
            </p>
            {movie.trailerUrl && (
              <div className="ratio ratio-16x9 mx-auto rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-50" style={{ maxWidth: '850px' }}>
                <iframe
                  src={movie.trailerUrl.includes('embed/') ? movie.trailerUrl : movie.trailerUrl.replace('watch?v=', 'embed/')}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => alert(`You have subscribed to alerts for ${movie.title}! We will notify you when advance bookings open.`)}
                className="btn btn-warning btn-lg px-4 fw-bold shadow text-dark"
              >
                <i className="bi bi-bell-fill me-2"></i> Notify Me When Booking Opens
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4">
            {/* Header row with date filters */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <div>
                <h3 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-danger"></i> Available Showtimes
                </h3>
                <p className="text-secondary small mb-0">
                  {filteredByFilters.length} show{filteredByFilters.length !== 1 ? 's' : ''} across {Object.keys(showtimesByTheater).length} screen{Object.keys(showtimesByTheater).length !== 1 ? 's' : ''} on this date
                </p>
              </div>

              {/* Date Selection Tabs */}
              <div className="d-flex flex-wrap gap-2">
                {availableDates.map((dateStr) => {
                  const info = formatDateDisplay(dateStr);
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`btn text-center py-2 px-3 rounded-3 transition-all ${
                        isSelected ? 'btn-danger shadow' : 'btn-outline-cinema'
                      }`}
                    >
                      <div className="small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{info.dayName}</div>
                      <div className="fs-5 fw-extrabold">{info.dayNum}</div>
                      <div className="small" style={{ fontSize: '0.65rem' }}>{info.monthName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Selection Bar (BookMyShow style) */}
            <div className="p-3 mb-4 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-75">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger fs-5"></i>
                  <span className="text-white fw-bold small text-uppercase">Select City:</span>
                </div>
                <span className="text-secondary small">
                  Showing theaters in <strong className="text-danger">{selectedCity === 'All' ? 'All Cities' : selectedCity}</strong>
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {allCities.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      if (city !== 'All' && changeCity) changeCity(city);
                    }}
                    className={`btn btn-sm px-3 py-1 rounded-pill transition-all ${
                      selectedCity === city
                        ? 'btn-danger fw-bold shadow'
                        : 'btn-outline-secondary text-light'
                    }`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-pin-map-fill me-1"></i>
                    {city}
                    {city === 'Indore' && ' (TI Mall, C21, Orbit)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filter Row */}
            <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
              <i className="bi bi-display text-warning"></i>
              <span className="text-secondary small fw-semibold">Format:</span>
              <button
                onClick={() => setSelectedFormat('All')}
                className={`btn btn-sm py-1 px-3 rounded-pill ${selectedFormat === 'All' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                All Formats
              </button>
              {allFormats.filter(f => f !== 'All').map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  style={{
                    background: selectedFormat === fmt ? (FORMAT_CONFIG[fmt]?.bg || '#222') : 'transparent',
                    color: selectedFormat === fmt ? (FORMAT_CONFIG[fmt]?.color || '#fff') : '#aaa',
                    border: `1.5px solid ${FORMAT_CONFIG[fmt]?.color || '#555'}`,
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {FORMAT_CONFIG[fmt]?.icon} {fmt}
                </button>
              ))}
            </div>

            {/* Showtimes list */}
            {Object.keys(showtimesByTheater).length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-3 d-block"></i>
                <h5 className="text-white">No showtimes for selected filters</h5>
                <p className="text-secondary small">Try changing the date, city, or format filter.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {Object.values(showtimesByTheater).map((th, idx) => (
                  <div key={idx} className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-50">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                      <div>
                        <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                          <i className="bi bi-geo-alt-fill text-danger"></i> {th.theaterName}
                        </h5>
                        <div className="text-secondary small d-flex flex-wrap align-items-center gap-2">
                          <span><i className="bi bi-pin-map me-1 text-secondary"></i>{th.location}</span>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                          <FormatBadge format={th.format} size="lg" />
                          <span className="text-secondary small">{th.screen}</span>
                          <span className="text-success small"><i className="bi bi-check-circle me-1"></i>Instant M-Ticket</span>
                        </div>
                        {/* Pricing info */}
                        <div className="mt-1" style={{ fontSize: '0.72rem', color: '#888' }}>
                          <i className="bi bi-tag me-1"></i>{FORMAT_PRICES_DISPLAY[th.format] || ''}
                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        {th.city && (
                          <span className="badge bg-secondary-subtle text-light border border-secondary" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-buildings me-1"></i>{th.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Show time buttons */}
                    <div className="d-flex flex-wrap gap-2">
                      {th.times.map((st) => {
                        const isFull = st.availableSeatsCount === 0;
                        const fillPct = Math.round(((st.totalSeatsCount - st.availableSeatsCount) / st.totalSeatsCount) * 100);
                        const fillClass = fillPct >= 80 ? 'text-danger' : fillPct >= 50 ? 'text-warning' : 'text-success';
                        const fillLabel = isFull ? 'Housefull' : fillPct >= 80 ? 'Filling Fast!' : `${st.availableSeatsCount} left`;
                        return (
                          <button
                            key={st._id}
                            disabled={isFull}
                            onClick={() => navigate(`/booking/${st._id}`)}
                            className={`btn text-start p-3 rounded-3 transition-all ${
                              isFull
                                ? 'btn-outline-secondary opacity-50 disabled'
                                : 'btn-outline-cinema hover-shadow'
                            }`}
                            style={{ minWidth: '130px' }}
                          >
                            <div className="fw-bold fs-6 text-white mb-1">
                              <i className="bi bi-clock me-1 text-warning"></i>
                              {st.time}
                            </div>
                            <div className="d-flex justify-content-between align-items-center small">
                              <span className="text-secondary">From ₹{st.pricing?.standard || 140}</span>
                              <span className={`fw-bold ${isFull ? 'text-danger' : fillClass}`} style={{ fontSize: '0.65rem' }}>
                                {fillLabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MovieDetailsPage;
