import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const isComingSoon = movie.status === 'COMING_SOON';

  // Format duration in minutes into hours and minutes
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <div className="movie-card position-relative">
      <Link to={`/movie/${movie._id}`} className="movie-poster-wrap d-block text-decoration-none position-relative">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {isComingSoon ? (
          <div className="position-absolute top-0 start-0 m-2 badge bg-warning text-dark fw-bold shadow-sm d-flex align-items-center gap-1">
            <i className="bi bi-rocket-takeoff-fill"></i> Coming Soon
          </div>
        ) : null}
        <div className="movie-rating-badge">
          <i className="bi bi-star-fill me-1 text-warning"></i>
          {movie.rating ? movie.rating.toFixed(1) : '8.5'}
        </div>
        <div className="movie-cert-badge">{movie.certification || 'UA'}</div>
      </Link>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-secondary-subtle text-light border border-secondary border-opacity-25" style={{ fontSize: '0.7rem' }}>
              {movie.language || 'English'}
            </span>
            <span className="text-secondary small">
              <i className="bi bi-clock me-1"></i>
              {formatDuration(movie.duration)}
            </span>
          </div>

          <h5 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
            <Link to={`/movie/${movie._id}`} className="text-white text-decoration-none hover-text-warning">
              {movie.title}
            </Link>
          </h5>

          <p className="text-secondary small mb-2 text-truncate" style={{ fontSize: '0.8rem' }}>
            {movie.genre?.join(', ')}
          </p>
        </div>

        <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between gap-2">
          {isComingSoon ? (
            <Link to={`/movie/${movie._id}`} className="btn btn-warning btn-sm flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1 text-dark shadow-sm">
              <i className="bi bi-play-btn-fill"></i> View Details & Teaser
            </Link>
          ) : (
            <>
              <Link to={`/movie/${movie._id}`} className="btn btn-outline-cinema btn-sm flex-grow-1">
                Details
              </Link>
              <Link to={`/movie/${movie._id}`} className="btn btn-cinema btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                <i className="bi bi-ticket-perforated"></i> Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

