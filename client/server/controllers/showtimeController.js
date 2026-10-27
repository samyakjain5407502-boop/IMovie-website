const mongoose = require('mongoose');
const Showtime = require('../models/Showtime');
const { memoryShowtimes } = require('../services/inMemoryStore');

// @desc    Get all showtimes for admin
// @route   GET /api/showtimes/admin/all
// @access  Private/Admin
const getAllShowtimesAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const showtimes = await Showtime.find()
        .populate('movieId', 'title posterUrl duration language')
        .sort({ date: 1, time: 1 });
      if (showtimes && showtimes.length > 0) {
        return res.json({
          success: true,
          count: showtimes.length,
          data: showtimes,
        });
      }
    }

    res.json({
      success: true,
      count: memoryShowtimes.length,
      data: memoryShowtimes,
    });
  } catch (error) {
    console.error('getAllShowtimesAdmin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get showtimes for a specific movie
// @route   GET /api/showtimes/movie/:movieId
// @access  Public
const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { movieId };
      if (date) {
        query.date = date;
      }
      const showtimes = await Showtime.find(query)
        .select('-seats.bookedBy')
        .sort({ date: 1, time: 1 });

      if (showtimes && showtimes.length > 0) {
        return res.json({
          success: true,
          count: showtimes.length,
          data: showtimes,
        });
      }
    }

    // In-memory fallback
    let list = memoryShowtimes.filter((st) => st.movieId.toString() === movieId.toString());
    if (date) {
      list = list.filter((st) => st.date === date);
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error('getShowtimesByMovie error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single showtime with full seat layout
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const showtime = await Showtime.findById(req.params.id).populate(
        'movieId',
        'title posterUrl backdropUrl duration certification language rating'
      );
      if (showtime) {
        return res.json({
          success: true,
          data: showtime,
        });
      }
    }

    // In-memory fallback
    const memSt = memoryShowtimes.find((st) => st._id.toString() === req.params.id.toString());
    if (!memSt) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    res.json({
      success: true,
      data: {
        ...memSt,
        movieId: memSt.movie,
      },
    });
  } catch (error) {
    console.error('getShowtimeById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new showtime
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const showtime = await Showtime.create(req.body);
      return res.status(201).json({ success: true, data: showtime });
    }
    const newSt = { ...req.body, _id: '6ae02000' + Date.now().toString(16) };
    memoryShowtimes.unshift(newSt);
    res.status(201).json({ success: true, data: newSt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Showtime.findByIdAndDelete(req.params.id);
    }
    const idx = memoryShowtimes.findIndex((st) => st._id.toString() === req.params.id.toString());
    if (idx !== -1) memoryShowtimes.splice(idx, 1);
    res.json({ success: true, message: 'Showtime removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllShowtimesAdmin,
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  deleteShowtime,
};
