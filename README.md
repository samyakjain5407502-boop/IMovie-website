# 🎬 IMovies - Movie Ticket Booking Made Simple

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application engineered for high-performance movie browsing, real-time seat availability tracking, showtime scheduling, and seamless ticket reservation.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Authorization
- **JWT (JSON Web Token)** secure session management stored in client localStorage.
- **Bcrypt.js** password hashing (salt rounds: 10).
- **Protected Routes** in React Router guarding seat checkout and user booking history.
- **One-Click Demo Login** (`demo@imovies.com` / `password123`) for instant review and testing.

### 2. 🍿 Movie Management & Browsing
- **Cinema Hero Carousel** featuring trending releases with high-resolution backdrops, ratings, and trailer previews.
- **Search & Filter System**:
  - Real-time search across movie title, description, and director.
  - Interactive genre filter pills (Action, Sci-Fi, Adventure, Animation, Drama, Crime, Biography).
  - Sorting options (Top Rated ⭐, Latest Releases 📅, Alphabetical).
- **Dedicated Movie Details Page**:
  - Full synopsis, certification (`PG-13`, `R`, `UA`), runtime, and language.
  - Top cast gallery with actor photos and character names.
  - YouTube trailer embed / links.
  - Multi-day showtime selector (Today, Tomorrow, Day After) with theater auditoriums and formats (`IMAX 3D`, `Dolby Atmos`, `4DX`).

### 3. 💺 Interactive Seat Selection & Booking Engine
- **Visual Auditorium Grid**:
  - Curved screen indicator ("All Eyes This Way").
  - Tiered seating structure:
    - **VIP Recliners** (Rows H, J)
    - **Premium Lounge** (Rows D - G)
    - **Standard Rows** (Rows A - C)
  - Realistic auditorium layout with center aisle walkway.
  - Clear three-state color visualization:
    - 🔵 **Available** (clickable with smooth hover glow)
    - 🟡 **Selected** (vibrant amber glow with live counter)
    - 🔒 **Reserved / Occupied** (disabled with indicator)
- **Real-Time Dynamic Pricing**:
  - Instant subtotal calculation as seats are picked or unpicked.
  - Automated convenience fee & tax calculation.
- **Checkout & Reservation Workflow**:
  - Multi-payment simulator (Credit/Debit Card, UPI / QR, Net Banking, IMovies Wallet).
  - Atomic reservation in MongoDB: flags selected seats as `isBooked: true` and decrements available seat count.
  - Digital Ticket generation with unique reference ID (e.g. `IMO-894123-K7P`) and scannable QR / barcode.

### 4. 🎟️ User Dashboard & Booking History
- Comprehensive overview of all tickets booked by the logged-in user.
- Filter tickets by status: **All**, **Active**, or **Cancelled**.
- Digital Ticket modal with **Print / Save as PDF** support.
- **Real-Time Booking Cancellation**:
  - Allows users to cancel tickets before the show.
  - Automatically frees up reserved seats in MongoDB back to `isBooked: false`, restoring auditorium capacity immediately.

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

