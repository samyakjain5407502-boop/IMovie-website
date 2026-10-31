import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    return { label, fullDate: dateStr, dayNum, dayName };
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      // Fetch movie info
      const movieRes = await API.get(`/movies/${id}`);
      setMovie(movieRes.data.data);

      // Fetch showtimes for this movie
      const showtimesRes = await API.get(`/showtimes/movie/${id}`);
      const stData = showtimesRes.data.data || [];
      setShowtimes(stData);

      // Extract unique dates
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

  // Group showtimes by theater
  const showtimesByTheater = filteredShowtimes.reduce((acc, curr) => {
    if (!acc[curr.theaterName]) {
      acc[curr.theaterName] = {
        theaterName: curr.theaterName,
        screen: curr.screen,
        format: curr.format,
        times: [],
      };
    }
    acc[curr.theaterName].times.push(curr);
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
                    <i className="bi bi-star-fill text-warning me-1"></i> {movie.rating?.toFixed(1)}
                  </div>
                  <div className="movie-cert-badge">{movie.certification}</div>
                </div>
              </div>
            </div>

            {/* Movie Info Details */}
            <div className="col-lg-9 col-md-8">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-3 py-1 fw-bold text-uppercase">
                  Now Showing
                </span>
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
                  <span>{movie.rating?.toFixed(1)}</span>
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
              <div className="d-flex flex-wrap gap-2 mb-4">
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
                <a href="#showtimes-section" className="btn btn-cinema btn-lg px-4 d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill fs-5"></i> View Showtimes & Seats
                </a>
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
            <h2 className="text-white fw-bold mb-2">Releasing Soon in IMovie Multiplexes!</h2>
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
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
            <div>
              <h3 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-danger"></i> Available Showtimes
              </h3>
              <p className="text-secondary small mb-0">
                Select your preferred date, theater, and time slot to pick seats.
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
                      isSelected
                        ? 'btn-danger shadow'
                        : 'btn-outline-cinema'
                    }`}
                  >
                    <div className="small fw-bold text-uppercase">{info.dayName}</div>
                    <div className="fs-5 fw-extrabold">{info.dayNum}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtimes list */}
          {Object.keys(showtimesByTheater).length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-3 d-block"></i>
              <h5 className="text-white">No showtimes scheduled for this date</h5>
              <p className="text-secondary small">Please select an alternate date from above.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {Object.values(showtimesByTheater).map((th, idx) => (
                <div key={idx} className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-50">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-geo-alt-fill text-danger"></i> {th.theaterName}
                      </h5>
                      <div className="text-secondary small d-flex align-items-center gap-2">
                        <span>{th.screen}</span>
                        <span>•</span>
                        <span className="badge bg-secondary-subtle text-light">{th.format}</span>
                        <span>•</span>
                        <span className="text-success"><i className="bi bi-check-circle me-1"></i>Instant M-Ticket</span>
                      </div>
                    </div>
                  </div>

                  {/* Show time buttons */}
                  <div className="d-flex flex-wrap gap-3">
                    {th.times.map((st) => {
                      const isFull = st.availableSeatsCount === 0;
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
                          style={{ minWidth: '150px' }}
                        >
                          <div className="fw-bold fs-6 text-white mb-1">
                            <i className="bi bi-clock me-1 text-warning"></i>
                            {st.time}
                          </div>
                          <div className="d-flex justify-content-between align-items-center small text-secondary">
                            <span>From ₹{st.pricing?.standard || 180}</span>
                            <span className={st.availableSeatsCount < 15 ? 'text-warning fw-bold' : 'text-success'}>
                              {isFull ? 'Sold Out' : `${st.availableSeatsCount} left`}
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

