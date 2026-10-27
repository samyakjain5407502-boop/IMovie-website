import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = [
  { label: 'All Cinema', value: 'All' },
  { label: 'Hindi (Bollywood)', value: 'Hindi' },
  { label: 'Telugu (Tollywood)', value: 'Telugu' },
  { label: 'Tamil (Kollywood)', value: 'Tamil' },
  { label: 'Malayalam (Mollywood)', value: 'Malayalam' },
  { label: 'Kannada (Sandalwood)', value: 'Kannada' },
  { label: 'English (Hollywood)', value: 'English' },
];

const HomePage = () => {
  const { selectedCity } = useAuth();

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trailer Modal
  const [activeTrailerUrl, setActiveTrailerUrl] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [sortBy]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/movies?sort=${sortBy}`);
      const data = res.data.data || [];
      setMovies(data);
      setFilteredMovies(data);

      const allGenres = Array.from(new Set(data.flatMap((m) => m.genre || [])));
      setGenres(['All', ...allGenres]);

      const featured = data.find((m) => m.featured) || data[0];
      setFeaturedMovie(featured);
    } catch (err) {
      console.error('Failed to load movies:', err);
      setError('Could not connect to the movie catalog. Please verify the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter effect based on Language industry, Search, and Genre
  useEffect(() => {
    let result = [...movies];

    if (selectedLanguage !== 'All') {
      result = result.filter((m) => m.language === selectedLanguage);
    }

    if (selectedGenre !== 'All') {
      result = result.filter((m) => m.genre && m.genre.includes(selectedGenre));
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.description.toLowerCase().includes(term) ||
          (m.director && m.director.toLowerCase().includes(term)) ||
          (m.language && m.language.toLowerCase().includes(term))
      );
    }

    setFilteredMovies(result);
  }, [searchTerm, selectedLanguage, selectedGenre, movies]);

  // Convert youtube url to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  return (
    <div className="pb-5">
      {/* Featured Hero Carousel Banner */}
      {featuredMovie && (
        <section className="container pt-3 pb-3">
          <div
            className="hero-banner shadow-lg"
            style={{
              backgroundImage: `url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
            }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-3 py-1 fw-bold text-uppercase">
                  <i className="bi bi-fire me-1"></i> Blockbuster Premiere
                </span>
                <span className="badge bg-dark border border-warning text-warning px-3 py-1 fw-bold">
                  <i className="bi bi-star-fill me-1"></i> {featuredMovie.rating} / 10
                </span>
                <span className="badge bg-secondary-subtle text-light px-2 py-1">
                  {featuredMovie.certification}
                </span>
                <span className="badge bg-dark border border-secondary text-light">
                  {featuredMovie.language}
                </span>
              </div>

              <h1 className="display-4 fw-black text-white brand-font mb-2">
                {featuredMovie.title}
              </h1>

              <p className="text-secondary small d-flex flex-wrap align-items-center gap-3 mb-3">
                <span><i className="bi bi-film me-1"></i> {featuredMovie.genre?.join(', ')}</span>
                <span><i className="bi bi-clock me-1"></i> {Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
                <span><i className="bi bi-geo-alt me-1 text-danger"></i> Showing in {selectedCity}</span>
              </p>

              <p className="text-light text-opacity-75 lead mb-4 d-none d-md-block" style={{ fontSize: '0.98rem', maxWidth: '620px' }}>
                {featuredMovie.description.length > 200
                  ? `${featuredMovie.description.substring(0, 200)}...`
                  : featuredMovie.description}
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to={`/movie/${featuredMovie._id}`} className="btn btn-cinema btn-lg px-4 d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill fs-5"></i> Book Showtimes
                </Link>
                {featuredMovie.trailerUrl && (
                  <button
                    onClick={() => setActiveTrailerUrl(featuredMovie.trailerUrl)}
                    className="btn btn-outline-cinema btn-lg px-4 d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-play-circle-fill fs-5 text-danger"></i> Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discovery, Search & Pan-India Industry Filter Bar */}
      <section className="container py-3" id="browse-section">
        {/* Industry Language Bar (Bollywood, Tollywood, Kollywood, etc.) */}
        <div className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-3">
          <span className="text-secondary small fw-bold text-uppercase text-nowrap me-1">
            <i className="bi bi-globe2 me-1 text-danger"></i> Industries:
          </span>
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              onClick={() => setSelectedLanguage(ind.value)}
              className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold text-nowrap transition-all ${
                selectedLanguage === ind.value
                  ? 'btn-danger shadow'
                  : 'btn-outline-cinema text-white-50'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Filter Toolbar Card */}
        <div className="glass-card p-4 mb-4">
          <div className="row g-3 align-items-center">
            {/* Live Search Input */}
            <div className="col-lg-5 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="Search Bollywood, Tollywood, Hollywood by title, actor, director..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-dark border-secondary text-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center gap-2">
                <label className="text-secondary small fw-semibold text-nowrap">Sort:</label>
                <select
                  className="form-select bg-dark border-secondary text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Top Rated ⭐</option>
                  <option value="releaseDate">Latest Releases 📅</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Location context info */}
            <div className="col-lg-4 text-lg-end text-secondary small">
              Cinema Cinemas in <strong className="text-warning">{selectedCity}</strong> • <strong>{filteredMovies.length}</strong> Movies
            </div>
          </div>

          {/* Genre Filter Pills */}
          <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
            <span className="text-secondary small fw-semibold align-self-center me-1">Genre:</span>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`btn btn-sm rounded-pill px-3 py-1 fw-medium transition-all ${
                  selectedGenre === g
                    ? 'btn-danger shadow-sm'
                    : 'btn-outline-secondary text-white-50 border-secondary border-opacity-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-secondary mt-3">Loading Bollywood & Pan-India movies...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center p-4 rounded-3">
            <i className="bi bi-exclamation-triangle-fill fs-3 mb-2 d-block"></i>
            <h5>{error}</h5>
            <button className="btn btn-outline-danger mt-3" onClick={fetchMovies}>
              <i className="bi bi-arrow-clockwise me-1"></i> Retry Connection
            </button>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-5 glass-card p-5">
            <i className="bi bi-film fs-1 text-secondary opacity-50 mb-3 d-block"></i>
            <h4 className="text-white">No Movies Found in {selectedLanguage}</h4>
            <p className="text-secondary">
              No results match your selected filters. Try switching to "All Cinema" or clear your search.
            </p>
            <button
              className="btn btn-cinema btn-sm mt-2"
              onClick={() => {
                setSearchTerm('');
                setSelectedLanguage('All');
                setSelectedGenre('All');
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredMovies.map((movie) => (
              <div className="col" key={movie._id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cinematic Experiences Section */}
      <section className="container py-4 mt-4">
        <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-stars text-warning"></i> Premier Multiplex Experiences in {selectedCity}
        </h4>
        <div className="row g-3">
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 text-center h-100 border-top border-3 border-danger">
              <span className="badge bg-danger text-white mb-2">IMAX LASER 3D</span>
              <p className="small text-secondary mb-0">Crystal-clear dual 4K laser projection with 12-channel immersive sound.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 text-center h-100 border-top border-3 border-primary">
              <span className="badge bg-primary text-white mb-2">4DX MOTION</span>
              <p className="small text-secondary mb-0">Synchronized motion seats with wind, fog, water, and lightning effects.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 text-center h-100 border-top border-3 border-warning">
              <span className="badge bg-warning text-dark fw-bold mb-2">DOLBY ATMOS 7.1</span>
              <p className="small text-secondary mb-0">Multidimensional audio that flows all around you with breathtaking realism.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="glass-card p-3 text-center h-100 border-top border-3 border-success">
              <span className="badge bg-success text-white mb-2">GOLD RECLINERS</span>
              <p className="small text-secondary mb-0">Plush push-back recliners with in-seat food & gourmet beverage service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded YouTube Trailer Modal */}
      {activeTrailerUrl && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card border-secondary text-light">
              <div className="modal-header border-secondary border-opacity-25 py-2">
                <h6 className="modal-title fw-bold text-white d-flex align-items-center gap-2 mb-0">
                  <i className="bi bi-play-circle-fill text-danger fs-5"></i> Official Theatrical Trailer
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setActiveTrailerUrl(null)}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(activeTrailerUrl) + '?autoplay=1'}
                  title="Movie Trailer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
