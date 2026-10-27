const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  col: {
    type: Number,
    required: true,
  },
  tier: {
    type: String,
    enum: ['STANDARD', 'PREMIUM', 'VIP'],
    default: 'PREMIUM',
  },
  price: {
    type: Number,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theaterName: {
      type: String,
      required: true,
      default: 'IMovies Cineplex - Downtown',
    },
    screen: {
      type: String,
      required: true,
      default: 'Screen 1 (IMAX with Laser)',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // HH:MM AM/PM e.g., '07:30 PM'
      required: true,
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 3D', '4DX'],
      default: 'IMAX 3D',
    },
    pricing: {
      standard: { type: Number, default: 180 },
      premium: { type: Number, default: 250 },
      vip: { type: Number, default: 380 },
    },
    seats: [seatSchema],
    totalSeats: {
      type: Number,
      default: 0,
    },
    availableSeatsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to calculate seat counts
showtimeSchema.pre('save', function (next) {
  if (this.seats && this.seats.length > 0) {
    this.totalSeats = this.seats.length;
    this.availableSeatsCount = this.seats.filter((s) => !s.isBooked).length;
  }
  next();
});

// Helper static function to generate standard seat grid for a showtime
showtimeSchema.statics.generateDefaultSeats = function (pricing = { standard: 180, premium: 250, vip: 380 }) {
  const rows = [
    { row: 'A', tier: 'STANDARD', price: pricing.standard },
    { row: 'B', tier: 'STANDARD', price: pricing.standard },
    { row: 'C', tier: 'STANDARD', price: pricing.standard },
    { row: 'D', tier: 'PREMIUM', price: pricing.premium },
    { row: 'E', tier: 'PREMIUM', price: pricing.premium },
    { row: 'F', tier: 'PREMIUM', price: pricing.premium },
    { row: 'G', tier: 'PREMIUM', price: pricing.premium },
    { row: 'H', tier: 'VIP', price: pricing.vip },
    { row: 'J', tier: 'VIP', price: pricing.vip },
  ];

  const seats = [];
  const cols = 10; // 10 seats per row (e.g. 1-4, aisle, 5-10)

  for (const r of rows) {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatNumber: `${r.row}${c}`,
        row: r.row,
        col: c,
        tier: r.tier,
        price: r.price,
        isBooked: false,
        bookedBy: null,
      });
    }
  }

  return seats;
};

module.exports = mongoose.model('Showtime', showtimeSchema);

