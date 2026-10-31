# 🎬 IMovies - Movie Ticket Booking Platform

> **Live Website:** [https://i-movie-website.vercel.app](https://i-movie-website.vercel.app)  
> **GitHub Repository:** [https://github.com/samyakjain5407502-boop/IMovie-website](https://github.com/samyakjain5407502-boop/IMovie-website)

A full-stack **MERN (MongoDB / In-Memory Serverless, Express.js, React.js, Node.js)** movie ticketing web application engineered with real-world BookMyShow-grade features: multi-city theater networks (including Indore, Mumbai, Delhi, etc.), visual auditorium seat layout with tiered pricing, 11 screen format experiences (3D, 4DX, IMAX 3D, Dolby Cinema, ScreenX), food & beverage concessions, realistic Razorpay checkout simulation, and Twilio SMS Verify OTP login.

---

## 🌟 Key Features

### 1. 🏙️ City-Isolated Real Theater Network
- **Indore Multi-Theater Coverage**:
  - **INOX TI Mall** (Treasure Island Mall, MG Road) — IMAX 3D, 4DX, Dolby Atmos, 2D, 3D
  - **PVR C21 Mall** (AB Road) — Dolby Cinema, RealD 3D, 2D, 3D
  - **Cinepolis Orbit Mall** (Vijay Nagar) — 4DX 3D, ScreenX, 2D, 3D
  - **INOX MR-10 Square** (MR-10 Square) — 4K HDR, 2D, 3D
  - **Fun Cinemas Indore** (C21 Mall, Ring Road) — 2D, 3D
- **Pan-India Theaters**: Mumbai (Phoenix Palladium, Inorbit Malad, VIP Andheri), Delhi (Select City Walk, Nehru Place), Hyderabad (AMB Cinemas), Bengaluru (VR Mall Whitefield, Garuda Mall), Chennai, Pune, Kolkata.
- **Location Filter Bar**: Dynamic city selection toggle with instant theater grouping.

### 2. 🎭 11 Advanced Screen Formats with Distinct Badges
- **2D, 3D, RealD 3D, IMAX 3D, IMAX Laser, Dolby Atmos, Dolby Cinema, 4DX, 4DX 3D, ScreenX, 4K HDR**
- Vibrant glowing format tags and instant format filter chips.
- Format-calibrated tiered pricing:
  - **Budget** (Rows A-C)
  - **Premium** (Rows D-F)
  - **Recliner** (Rows G-H)

### 3. 🍿 Movie Catalog (Bollywood, Tollywood, Hollywood)
- **24 Blockbuster Movies** with official TMDB posters, high-res backdrops, ratings, synopsis, and cast lists.
- **Now Showing & Coming Soon tabs** (Ramayana Part 1, War 2, Godzilla Minus One, Kalki Part 2, Avatar Fire and Ash) with embedded trailer teaser mode.
- Search by movie title, genre, language, director, and rating.

### 4. 💺 Interactive Seat Selection & Snacks
- Visual auditorium layout with curved screen indicator and center aisle.
- Real-time seat reservation tracking (Available, Selected, Reserved).
- **Concessions Add-on**: Gourmet Popcorn, Nachos with Salsa, Chilled Fountain Soda, and Saver Combos.

### 5. 💳 Razorpay Checkout Simulation (Test Mode)
- **UPI**: GPay, PhonePe, Paytm, BHIM with 1-click Test VPA auto-fill.
- **Card**: Auto-fill with official Razorpay test card (`4111 2222 3333 4444`).
- **Net Banking & Wallets**: Top Indian banks and mobile wallets.
- **Digital M-Ticket**: Issued with Razorpay Payment ID, booking reference, and QR code.

### 6. 🔐 Authentication & Twilio Verify OTP
- Email & Password Login / Register.
- Phone number OTP verification via **Twilio Verify API** (`IMovies` service).
- **One-Click Demo Login** (`demo@imovies.com`) and **Admin Login** (`admin@imovies.com`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js 18, HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons, Vite, Axios |
| **Backend** | Node.js, Express.js, JSON Web Token (JWT), Bcrypt.js, CORS, Dotenv |
| **Database** | MongoDB (Mongoose ODM 8.x) with automatic in-memory fallback for zero-configuration local runs |

---

## 📁 Monorepo File Structure

```
I.movies/
├── package.json               # Root scripts (npm run dev, install:all, seed)
├── README.md                  # Comprehensive documentation
│
├── client/                    # React Frontend (Vite + Bootstrap 5)
│   ├── package.json
│   ├── vite.config.js         # Vite config with /api proxy to port 5000
│   ├── index.html
│   └── src/
│       ├── main.jsx           # Entry point (Bootstrap CSS/JS, Router, Auth)
│       ├── App.jsx            # App routes & layout
│       ├── index.css          # Cinematic dark theme & seat layout styles
│       ├── context/
│       │   └── AuthContext.jsx # Global JWT authentication context
│       ├── services/
│       │   └── api.js         # Axios instance with request/response interceptors
│       ├── components/
│       │   ├── Navbar.jsx     # Header navigation & user dropdown
│       │   ├── Footer.jsx     # Responsive cinema footer
│       │   ├── MovieCard.jsx  # Reusable movie card with poster & ratings
│       │   └── ProtectedRoute.jsx # Route authentication guard
│       └── pages/
│           ├── HomePage.jsx         # Hero banner, search, filters & movie grid
│           ├── MovieDetailsPage.jsx # Synopsis, cast, trailer & showtimes
│           ├── SeatBookingPage.jsx  # Interactive seat map & checkout
│           ├── UserDashboard.jsx    # My Bookings, tickets & cancellation
│           ├── LoginPage.jsx        # User sign in + 1-click demo login
│           └── RegisterPage.jsx     # User registration
│
└── server/                    # Node.js + Express.js + MongoDB API
    ├── package.json
    ├── server.js              # Express app entry & auto-seeder
    ├── .env.example           # Environment template
    ├── .env                   # Configuration file
    ├── config/
    │   └── db.js              # MongoDB connection (with automatic in-memory fallback)
    ├── models/
    │   ├── User.js            # User schema & password hashing
    │   ├── Movie.js           # Movie schema & search indexing
    │   ├── Showtime.js        # Showtime schema & seat grid generator
    │   └── Booking.js         # Booking records & references
    ├── controllers/
    │   ├── authController.js
    │   ├── movieController.js
    │   ├── showtimeController.js
    │   └── bookingController.js
    ├── middleware/
    │   ├── authMiddleware.js  # JWT Bearer token verification
    │   └── errorHandler.js    # Centralized error handler
    ├── routes/
    │   ├── authRoutes.js
    │   ├── movieRoutes.js
    │   ├── showtimeRoutes.js
    │   └── bookingRoutes.js
    └── seed/
        └── seedData.js        # Seeder with 6 blockbusters, 72 showtimes & users
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Installation
From the root directory, install all dependencies:
```bash
npm run install:all
```
*(Or install inside `server` and `client` individually via `cd server && npm install` and `cd client && npm install`)*

### 3. Environment Setup
The server is already configured with sensible defaults in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_secure
NODE_ENV=development
```
> **Note on MongoDB**: If a local MongoDB service is running on `27017`, the app will automatically connect to it. If not, the server includes a built-in embedded in-memory MongoDB fallback, ensuring the application runs seamlessly out-of-the-box!

### 4. Seed the Database
To populate the database with sample movies (Dune: Part Two, Oppenheimer, Spider-Man, Interstellar, Inception, The Dark Knight), 72 showtimes across multiple theaters, and sample users:
```bash
npm run seed
```
*(The server also auto-seeds on first startup if no movies are detected)*

### 5. Start the Application
Run both the backend API and frontend client with a single command:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Regular User** | `demo@imovies.com` | `password123` |
| **Admin** | `admin@imovies.com` | `admin123` |

*(You can also use the **Demo Login** button on the navbar or login screen to sign in instantly without typing).*

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login & receive JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `GET` | `/api/movies` | Public | List movies (with `?search=`, `?genre=`, `?sort=`) |
| `GET` | `/api/movies/:id` | Public | Get movie details & cast |
| `POST` | `/api/movies` | Admin | Create new movie entry |
| `GET` | `/api/showtimes/movie/:movieId` | Public | Get showtimes for movie |
| `GET` | `/api/showtimes/:id` | Public | Get showtime & interactive seat layout |
| `POST` | `/api/bookings` | Private | Reserve seats & create booking |
| `GET` | `/api/bookings/my-bookings` | Private | Get current user's active & past bookings |
| `GET` | `/api/bookings/:id` | Private | Get single booking ticket details |
| `PUT` | `/api/bookings/:id/cancel` | Private | Cancel ticket & release reserved seats |
| `GET` | `/api/health` | Public | Service health & timestamp |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

