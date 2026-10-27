const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { memoryMovies } = require('../services/inMemoryStore');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre, language, status, sort } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (search && search.trim() !== '') {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { director: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      if (genre && genre !== 'All' && genre !== '') {
        query.genre = { $in: [new RegExp(genre, 'i')] };
      }

      if (language && language !== 'All' && language !== '') {
        query.language = { $regex: language, $options: 'i' };
      }

      if (status && status !== 'All' && status !== '') {
        query.status = status;
      }

      let sortOption = { rating: -1 }; // default: highest rating first
      if (sort === 'releaseDate') {
        sortOption = { releaseDate: -1 };
      } else if (sort === 'title') {
        sortOption = { title: 1 };
      }

      const movies = await Movie.find(query).sort(sortOption);
      if (movies && movies.length > 0) {
        const allGenres = await Movie.distinct('genre');
        const allLanguages = await Movie.distinct('language');

        return res.json({
          success: true,
          count: movies.length,
          genres: allGenres,
          languages: allLanguages,
          data: movies,
        });
      }
    }

    // In-Memory Fallback
    let result = [...memoryMovies];

    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(s)) ||
          (m.description && m.description.toLowerCase().includes(s)) ||
          (m.director && m.director.toLowerCase().includes(s))
      );
    }

    if (genre && genre !== 'All' && genre !== '') {
      result = result.filter((m) => m.genre && m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }

    if (language && language !== 'All' && language !== '') {
      result = result.filter((m) => m.language && m.language.toLowerCase() === language.toLowerCase());
    }

    if (status && status !== 'All' && status !== '') {
      result = result.filter((m) => m.status === status);
    }

    if (sort === 'releaseDate') {
      result.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
    } else if (sort === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const allGenres = Array.from(new Set(memoryMovies.flatMap((m) => m.genre || [])));
    const allLanguages = Array.from(new Set(memoryMovies.map((m) => m.language).filter(Boolean)));

    res.json({
      success: true,
      count: result.length,
      genres: allGenres,
      languages: allLanguages,
      data: result,
    });
  } catch (error) {
    console.error('getMovies error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.findById(req.params.id);
      if (movie) {
        return res.json({ success: true, data: movie });
      }
    }

    // In-memory fallback
    const memMovie = memoryMovies.find((m) => m._id.toString() === req.params.id.toString());
    if (!memMovie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      data: memMovie,
    });
  } catch (error) {
    console.error('getMovieById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.create(req.body);
      return res.status(201).json({ success: true, data: movie });
    }
    const newMovie = { ...req.body, _id: '6ae01000' + Date.now().toString(16) };
    memoryMovies.unshift(newMovie);
    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (movie) return res.json({ success: true, data: movie });
    }
    const idx = memoryMovies.findIndex((m) => m._id.toString() === req.params.id.toString());
    if (idx !== -1) {
      memoryMovies[idx] = { ...memoryMovies[idx], ...req.body };
      return res.json({ success: true, data: memoryMovies[idx] });
    }
    res.status(404).json({ success: false, message: 'Movie not found' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (movie) return res.json({ success: true, message: 'Movie deleted successfully' });
    }
    const idx = memoryMovies.findIndex((m) => m._id.toString() === req.params.id.toString());
    if (idx !== -1) {
      memoryMovies.splice(idx, 1);
      return res.json({ success: true, message: 'Movie deleted successfully' });
    }
    res.status(404).json({ success: false, message: 'Movie not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
