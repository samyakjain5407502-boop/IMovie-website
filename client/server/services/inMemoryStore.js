const { sampleMovies, sampleUsers, CINEMAS, TIME_SLOTS } = require('../seed/seedData');

// Ensure all sample movies have unique string IDs
const memoryMovies = sampleMovies.map((m, idx) => ({
  ...m,
  _id: m._id ? m._id.toString() : `6ae0100000000000000000${idx.toString(16).padStart(2, '0')}`,
}));

// Helper to generate seat grid for in-memory showtimes
const generateSeatLayout = () => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = 12;

  rows.forEach((row) => {
    let tier = 'STANDARD';
    let price = 180;

    if (row === 'A' || row === 'B') {
      tier = 'BUDGET';
      price = 140;
    } else if (row === 'C' || row === 'D' || row === 'E') {
      tier = 'STANDARD';
      price = 200;
    } else if (row === 'F' || row === 'G') {
      tier = 'PREMIUM';
      price = 280;
    } else if (row === 'H') {
      tier = 'RECLINER';
      price = 450;
    }

    for (let c = 1; c <= cols; c++) {
      const seatNumber = `${row}${c}`;
      // Randomly mark a few seats as booked
      const isBooked = Math.random() < 0.15;
      seats.push({
        seatNumber,
        row,
        number: c,
        tier,
        price,
        status: isBooked ? 'BOOKED' : 'AVAILABLE',
      });
    }
  });

  return seats;
};

// Generate in-memory showtimes
const memoryShowtimes = [];
const today = new Date();
const dates = [];
for (let i = 0; i < 4; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  dates.push(d.toISOString().split('T')[0]);
}

let stCount = 0;
memoryMovies.forEach((movie) => {
  const selectedCinemas = [
    { name: 'PVR ICON: Phoenix Palladium', location: 'Lower Parel, Mumbai', screen: 'Audi 1 (IMAX with Laser)' },
    { name: 'INOX Megaplex: Inorbit Mall', location: 'Malad, Mumbai', screen: 'Screen 4 (Dolby Atmos)' },
    { name: 'Cinepolis VIP: Viviana Mall', location: 'Thane, Mumbai', screen: 'VIP Audi 2 (4DX)' },
  ];

  selectedCinemas.forEach((cinema) => {
    dates.forEach((dateStr) => {
      ['10:30 AM', '02:00 PM', '06:15 PM', '09:45 PM'].forEach((timeSlot) => {
        stCount++;
        memoryShowtimes.push({
          _id: `6ae02000000000000000${stCount.toString(16).padStart(4, '0')}`,
          movieId: movie._id,
          movie: movie,
          cinemaName: cinema.name,
          location: cinema.location,
          screen: cinema.screen,
          date: dateStr,
          time: timeSlot,
          format: cinema.screen.includes('IMAX') ? 'IMAX 3D' : '2D',
          language: movie.language,
          seats: generateSeatLayout(),
          availableSeatsCount: 82,
          totalSeatsCount: 96,
        });
      });
    });
  });
});

const memoryBookings = [];

module.exports = {
  memoryMovies,
  memoryShowtimes,
  memoryBookings,
};

