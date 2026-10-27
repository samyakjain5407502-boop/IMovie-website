const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { memoryShowtimes, memoryBookings, memoryMovies } = require('../services/inMemoryStore');

// Generate unique booking reference
const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `IMO-${timestamp}-${randomChars}`;
};

// @desc    Create a new booking and reserve seats
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats: requestedSeats, paymentMethod, snacksTotal = 0, snacks = [] } = req.body;

    if (!showtimeId || !requestedSeats || !Array.isArray(requestedSeats) || requestedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showtimeId and an array of selected seat numbers',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const showtime = await Showtime.findById(showtimeId).populate('movieId');
      if (showtime) {
        const seatMap = new Map(showtime.seats.map((s) => [s.seatNumber, s]));
        const seatDetails = [];
        let subtotal = 0;

        for (const seatNum of requestedSeats) {
          const seat = seatMap.get(seatNum);
          if (!seat) {
            return res.status(400).json({ success: false, message: `Seat ${seatNum} is invalid` });
          }
          if (seat.isBooked) {
            return res.status(400).json({ success: false, message: `Seat ${seatNum} is already booked` });
          }
          seatDetails.push({ seatNumber: seat.seatNumber, tier: seat.tier, price: seat.price });
          subtotal += seat.price;
        }

        const convenienceFee = Math.round(subtotal * 0.08);
        const totalAmount = subtotal + convenienceFee + Number(snacksTotal || 0);

        requestedSeats.forEach((seatNum) => {
          const seat = seatMap.get(seatNum);
          seat.isBooked = true;
          seat.bookedBy = req.user._id;
        });

        showtime.availableSeats = Math.max(0, showtime.availableSeats - requestedSeats.length);
        await showtime.save();

        const booking = await Booking.create({
          bookingReference: generateBookingReference(),
          userId: req.user._id,
          showtimeId: showtime._id,
          movieId: showtime.movieId._id,
          seats: requestedSeats,
          seatDetails,
          subtotal,
          convenienceFee,
          snacksTotal: Number(snacksTotal || 0),
          snacks,
          totalAmount,
          paymentMethod: paymentMethod || 'UPI / Card',
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        });

        return res.status(201).json({ success: true, data: booking });
      }
    }

    // In-memory fallback
    const memSt = memoryShowtimes.find((st) => st._id.toString() === showtimeId.toString());
    if (!memSt) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    let subtotal = 0;
    const seatDetails = requestedSeats.map((sNum) => {
      const seat = memSt.seats.find((s) => s.seatNumber === sNum) || { seatNumber: sNum, tier: 'PREMIUM', price: 250 };
      seat.status = 'BOOKED';
      subtotal += seat.price;
      return { seatNumber: sNum, tier: seat.tier, price: seat.price };
    });

    const convenienceFee = Math.round(subtotal * 0.08);
    const totalAmount = subtotal + convenienceFee + Number(snacksTotal || 0);

    const memBooking = {
      _id: '6ae03000' + Date.now().toString(16),
      bookingReference: generateBookingReference(),
      userId: req.user._id,
      showtimeId: memSt,
      movieId: memSt.movie || memSt.movieId,
      seats: requestedSeats,
      seatDetails,
      subtotal,
      convenienceFee,
      snacksTotal: Number(snacksTotal || 0),
      snacks,
      totalAmount,
      paymentMethod: paymentMethod || 'UPI / Card',
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    memoryBookings.unshift(memBooking);

    res.status(201).json({
      success: true,
      data: memBooking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookings (Dashboard)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find({ userId: req.user._id })
        .populate('movieId', 'title posterUrl backdropUrl duration certification language')
        .populate('showtimeId', 'cinemaName location screen date time format')
        .sort({ createdAt: -1 });

      if (bookings && bookings.length > 0) {
        return res.json({ success: true, count: bookings.length, data: bookings });
      }
    }

    const list = memoryBookings.filter((b) => b.userId.toString() === req.user._id.toString());
    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(req.params.id)
        .populate('movieId', 'title posterUrl backdropUrl duration certification language')
        .populate('showtimeId', 'cinemaName location screen date time format')
        .populate('userId', 'name email');
      if (booking) return res.json({ success: true, data: booking });
    }

    const b = memoryBookings.find((x) => x._id.toString() === req.params.id.toString());
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: b });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(req.params.id);
      if (booking) {
        booking.status = 'CANCELLED';
        await booking.save();
        return res.json({ success: true, message: 'Booking cancelled successfully' });
      }
    }
    const b = memoryBookings.find((x) => x._id.toString() === req.params.id.toString());
    if (b) b.status = 'CANCELLED';
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get all bookings
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookingsAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find()
        .populate('movieId', 'title posterUrl')
        .populate('userId', 'name email')
        .populate('showtimeId', 'cinemaName screen date time')
        .sort({ createdAt: -1 });
      if (bookings && bookings.length > 0) return res.json({ success: true, count: bookings.length, data: bookings });
    }
    res.json({ success: true, count: memoryBookings.length, data: memoryBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get summary statistics
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalMovies = memoryMovies.length;
    const totalShowtimes = memoryShowtimes.length;
    const totalBookings = memoryBookings.length;
    const totalRevenue = memoryBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        activeMovies: totalMovies,
        totalShowtimes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookingsAdmin,
  getAdminStats,
};
