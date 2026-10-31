import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load movie & showtime catalog safely
let catalog = { movies: [], showtimes: [] };
try {
  const data = readFileSync(join(__dirname, 'catalogData.json'), 'utf8');
  catalog = JSON.parse(data);
} catch (e) {
  console.error('Failed to read catalogData.json:', e);
}

// In-memory bookings store
const bookingsStore = [];

// Helper to send response safely
const sendJson = (res, statusCode, data) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
};

// Helper to parse JSON body for POST/PUT requests
const parseBody = (req) => {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
};

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  const path = parsedUrl.pathname.replace(/^\/api/, '');
  const searchParams = parsedUrl.searchParams;

  // 1. Health check & Ping
  if (path === '' || path === '/' || path === '/health' || path === '/ping') {
    return sendJson(res, 200, {
      status: 'healthy',
      name: 'IMovies API - Ultra Fast Serverless',
      version: '1.0.0',
      moviesCount: catalog.movies.length,
      time: new Date().toISOString(),
    });
  }

  // 2. Movies Routes
  if (path === '/movies') {
    if (req.method === 'GET') {
      const search = (searchParams.get('search') || '').trim().toLowerCase();
      const genre = searchParams.get('genre') || '';
      const language = searchParams.get('language') || '';
      const status = searchParams.get('status') || '';
      const sort = searchParams.get('sort') || 'rating';

      let result = [...catalog.movies];

      if (search) {
        result = result.filter(
          (m) =>
            (m.title && m.title.toLowerCase().includes(search)) ||
            (m.description && m.description.toLowerCase().includes(search)) ||
            (m.director && m.director.toLowerCase().includes(search))
        );
      }

      if (genre && genre !== 'All') {
        result = result.filter((m) => m.genre && m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
      }

      if (language && language !== 'All') {
        result = result.filter((m) => m.language && m.language.toLowerCase() === language.toLowerCase());
      }

      if (status && status !== 'All') {
        result = result.filter((m) => m.status === status);
      }

      if (sort === 'releaseDate') {
        result.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
      } else if (sort === 'title') {
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      const allGenres = Array.from(new Set(catalog.movies.flatMap((m) => m.genre || [])));
      const allLanguages = Array.from(new Set(catalog.movies.map((m) => m.language).filter(Boolean)));

      return sendJson(res, 200, {
        success: true,
        count: result.length,
        genres: allGenres,
        languages: allLanguages,
        data: result,
      });
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const newMovie = {
        ...body,
        _id: 'mov_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      catalog.movies.unshift(newMovie);
      return sendJson(res, 201, { success: true, data: newMovie });
    }
  }

  // Single movie by ID
  const movieMatch = path.match(/^\/movies\/([^/]+)$/);
  if (movieMatch) {
    const movieId = movieMatch[1];
    if (req.method === 'GET') {
      const movie = catalog.movies.find((m) => m._id === movieId || m.id === movieId);
      if (!movie) {
        return sendJson(res, 404, { success: false, message: 'Movie not found' });
      }
      return sendJson(res, 200, { success: true, data: movie });
    }
    if (req.method === 'DELETE') {
      catalog.movies = catalog.movies.filter((m) => m._id !== movieId && m.id !== movieId);
      return sendJson(res, 200, { success: true, message: 'Movie removed' });
    }
  }

  // 3. Showtimes Routes
  if (path === '/showtimes/admin/all') {
    return sendJson(res, 200, {
      success: true,
      count: catalog.showtimes.length,
      data: catalog.showtimes,
    });
  }

  const showtimeMovieMatch = path.match(/^\/showtimes\/movie\/([^/]+)$/);
  if (showtimeMovieMatch) {
    const movieId = showtimeMovieMatch[1];
    const date = searchParams.get('date');
    let movieShowtimes = catalog.showtimes.filter((s) => s.movieId === movieId || s.movieId?._id === movieId);
    if (date) {
      movieShowtimes = movieShowtimes.filter((s) => s.date === date);
    }
    return sendJson(res, 200, {
      success: true,
      count: movieShowtimes.length,
      data: movieShowtimes,
    });
  }

  const showtimeDetailMatch = path.match(/^\/showtimes\/([^/]+)$/);
  if (showtimeDetailMatch) {
    const showtimeId = showtimeDetailMatch[1];
    if (req.method === 'GET') {
      const showtime = catalog.showtimes.find((s) => s._id === showtimeId || s.id === showtimeId);
      if (!showtime) {
        return sendJson(res, 404, { success: false, message: 'Showtime not found' });
      }
      return sendJson(res, 200, { success: true, data: showtime });
    }
    if (req.method === 'DELETE') {
      catalog.showtimes = catalog.showtimes.filter((s) => s._id !== showtimeId && s.id !== showtimeId);
      return sendJson(res, 200, { success: true, message: 'Showtime deleted' });
    }
  }

  if (path === '/showtimes' && req.method === 'POST') {
    const body = await parseBody(req);
    const newShowtime = {
      ...body,
      _id: 'sht_' + Date.now(),
      seats: body.seats || [],
    };
    catalog.showtimes.push(newShowtime);
    return sendJson(res, 201, { success: true, data: newShowtime });
  }

  // 4. Bookings Routes
  if (path === '/bookings/admin/stats') {
    const totalRevenue = bookingsStore.reduce((acc, b) => acc + (b.totalAmount || 0), 125000);
    return sendJson(res, 200, {
      success: true,
      data: {
        totalBookings: bookingsStore.length + 184,
        totalRevenue,
        totalUsers: 89,
        totalMovies: catalog.movies.length,
      },
    });
  }

  if (path === '/bookings/admin/all') {
    return sendJson(res, 200, {
      success: true,
      count: bookingsStore.length,
      data: bookingsStore,
    });
  }

  if (path === '/bookings/my-bookings') {
    return sendJson(res, 200, {
      success: true,
      count: bookingsStore.length,
      data: bookingsStore,
    });
  }

  if (path === '/bookings' && req.method === 'POST') {
    const body = await parseBody(req);
    const booking = {
      _id: 'bkg_' + Date.now(),
      bookingNumber: 'IMV' + Math.floor(100000 + Math.random() * 900000),
      ...body,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
    };
    bookingsStore.unshift(booking);
    return sendJson(res, 201, {
      success: true,
      message: 'Tickets booked successfully!',
      data: booking,
    });
  }

  const cancelMatch = path.match(/^\/bookings\/([^/]+)\/cancel$/);
  if (cancelMatch && req.method === 'PUT') {
    const bookingId = cancelMatch[1];
    const b = bookingsStore.find((item) => item._id === bookingId);
    if (b) {
      b.status = 'CANCELLED';
    }
    return sendJson(res, 200, { success: true, message: 'Booking cancelled' });
  }

  // 5. Auth Routes
  if (path === '/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const isAdmin = body.email === 'admin@imovies.com';
    return sendJson(res, 200, {
      success: true,
      token: 'jwt_demo_token_' + Date.now(),
      user: {
        _id: isAdmin ? 'usr_admin_01' : 'usr_demo_01',
        name: isAdmin ? 'Cinema Manager (Admin)' : 'Movie Fan',
        email: body.email,
        role: isAdmin ? 'admin' : 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
    });
  }

  if (path === '/auth/register' && req.method === 'POST') {
    const body = await parseBody(req);
    return sendJson(res, 201, {
      success: true,
      token: 'jwt_demo_token_' + Date.now(),
      user: {
        _id: 'usr_' + Date.now(),
        name: body.name || 'Movie Fan',
        email: body.email,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
    });
  }

  if (path === '/auth/send-otp' && req.method === 'POST') {
    return sendJson(res, 200, {
      success: true,
      message: 'OTP sent successfully to registered Mobile and Email!',
    });
  }

  if (path === '/auth/verify-otp' && req.method === 'POST') {
    const body = await parseBody(req);
    return sendJson(res, 200, {
      success: true,
      token: 'jwt_otp_token_' + Date.now(),
      user: {
        _id: 'usr_verified_' + Date.now(),
        name: 'Verified User',
        email: body.identifier || 'user@imovies.com',
        role: 'user',
      },
    });
  }

  if (path === '/auth/me') {
    return sendJson(res, 200, {
      success: true,
      user: {
        _id: 'usr_demo_01',
        name: 'Movie Fan',
        email: 'user@imovies.com',
        role: 'user',
      },
    });
  }

  // 404 Fallback
  return sendJson(res, 404, {
    success: false,
    message: `API endpoint not found: ${req.method} ${path}`,
  });
}
