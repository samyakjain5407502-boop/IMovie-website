const express = require('express');
const router = express.Router();
const {
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  getAllShowtimesAdmin,
  deleteShowtime,
} = require('../controllers/showtimeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, admin, getAllShowtimesAdmin);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtimeById);
router.post('/', protect, admin, createShowtime);
router.delete('/:id', protect, admin, deleteShowtime);

module.exports = router;
