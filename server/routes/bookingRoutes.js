const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookingsAdmin,
  getAdminStats,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/all', protect, admin, getAllBookingsAdmin);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
