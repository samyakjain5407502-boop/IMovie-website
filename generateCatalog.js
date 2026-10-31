/**
 * generateCatalog.js  (v2 — City-correct theaters)
 * ─────────────────────────────────────────────────
 * Each city has its own real theaters.
 * Every NOW_SHOWING movie gets showtimes in ALL cities.
 * Run: node generateCatalog.js
 */

import { writeFileSync } from 'fs';

// ─── DATES ───────────────────────────────────────────────────────────────────
function getNextDates(count = 5) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
const SHOW_DATES = getNextDates(5);

// ─── FORMAT PRICING ───────────────────────────────────────────────────────────
const FORMAT_PRICES = {
  '2D':           { BUDGET: 140, PREMIUM: 240, RECLINER: 380 },
  '3D':           { BUDGET: 170, PREMIUM: 280, RECLINER: 450 },
  'RealD 3D':     { BUDGET: 190, PREMIUM: 300, RECLINER: 470 },
  'IMAX 3D':      { BUDGET: 280, PREMIUM: 400, RECLINER: 600 },
  'IMAX Laser':   { BUDGET: 320, PREMIUM: 450, RECLINER: 650 },
  'Dolby Atmos':  { BUDGET: 220, PREMIUM: 340, RECLINER: 500 },
  'Dolby Cinema': { BUDGET: 260, PREMIUM: 380, RECLINER: 550 },
  '4DX':          { BUDGET: 350, PREMIUM: 480, RECLINER: 700 },
  '4DX 3D':       { BUDGET: 380, PREMIUM: 520, RECLINER: 750 },
  'ScreenX':      { BUDGET: 300, PREMIUM: 420, RECLINER: 580 },
  '4K HDR':       { BUDGET: 200, PREMIUM: 320, RECLINER: 490 },
};

// ─── SEAT GENERATION ─────────────────────────────────────────────────────────
function generateSeats(format) {
  const prices = FORMAT_PRICES[format] || FORMAT_PRICES['2D'];
  const seats = [];
  const ROWS = ['A','B','C','D','E','F','G','H'];
  const TIER_MAP = { A:'BUDGET', B:'BUDGET', C:'BUDGET', D:'PREMIUM', E:'PREMIUM', F:'PREMIUM', G:'RECLINER', H:'RECLINER' };
  for (const row of ROWS) {
    const tier = TIER_MAP[row];
    const price = prices[tier];
    for (let col = 1; col <= 12; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        row, col, tier, price,
        isBooked: Math.random() < 0.22,
      });
    }
  }
  return seats;
}

// ─── CITY-WISE THEATERS ───────────────────────────────────────────────────────
// Each city has 3-5 real theaters, each with city-appropriate formats & times
const CITIES = {

  // ════════════════════════════════════════════════
  // INDORE
  // ════════════════════════════════════════════════
  Indore: [
    {
      name: 'INOX TI Mall',
      location: 'Treasure Island Mall, MG Road, Indore',
      formats: {
        '2D':          { screen: 'Screen 1 — Regular',    times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM','10:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D Hall',    times: ['11:00 AM','02:30 PM','06:00 PM','09:15 PM'] },
        'Dolby Atmos': { screen: 'Dolby Auditorium',      times: ['12:00 PM','03:30 PM','07:00 PM'] },
        'IMAX 3D':     { screen: 'IMAX Screen',           times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        '4DX':         { screen: '4DX Experience Arena',  times: ['11:30 AM','03:00 PM','06:30 PM','09:45 PM'] },
      },
    },
    {
      name: 'PVR C21 Mall',
      location: 'C21 Mall, AB Road, Indore',
      formats: {
        '2D':          { screen: 'Screen 1 — Regular',     times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',          times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema Hall',      times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'RealD 3D':    { screen: 'RealD Auditorium',       times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'Cinepolis Orbit Mall',
      location: 'Orbit Mall, Vijay Nagar, Indore',
      formats: {
        '2D':          { screen: 'Audi 1 — Classic',   times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Audi 2 — 3D',        times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        '4DX 3D':      { screen: '4DX 3D Arena',       times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'ScreenX':     { screen: 'ScreenX Hall',        times: ['11:30 AM','03:00 PM','07:00 PM'] },
      },
    },
    {
      name: 'INOX MR-10 Square',
      location: 'MR-10 Square Mall, Indore',
      formats: {
        '2D':          { screen: 'Screen 1',     times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['11:00 AM','02:00 PM','05:00 PM','08:00 PM'] },
        '4K HDR':      { screen: '4K Premium Hall', times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'Fun Cinemas Indore',
      location: 'C21 Mall, Ring Road, Indore',
      formats: {
        '2D':          { screen: 'Screen 1',     times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM','10:30 PM'] },
        '3D':          { screen: 'Screen 3 — 3D', times: ['11:00 AM','02:30 PM','06:00 PM','09:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // MUMBAI
  // ════════════════════════════════════════════════
  Mumbai: [
    {
      name: 'PVR ICON Phoenix Palladium',
      location: 'Phoenix Palladium Mall, Lower Parel, Mumbai',
      formats: {
        '2D':          { screen: 'Screen 1 — Standard',    times: ['09:00 AM','12:15 PM','03:30 PM','06:45 PM','09:45 PM'] },
        '3D':          { screen: 'Screen 3 — 3D',          times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'] },
        'IMAX 3D':     { screen: 'IMAX Auditorium',        times: ['09:30 AM','12:45 PM','04:00 PM','07:15 PM','10:15 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema Hall',      times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        '4DX':         { screen: '4DX Experience',         times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
      },
    },
    {
      name: 'INOX Megaplex Inorbit Mall',
      location: 'Inorbit Mall, Malad West, Mumbai',
      formats: {
        '2D':          { screen: 'Screen 2 — Regular',     times: ['10:15 AM','01:30 PM','04:45 PM','08:00 PM'] },
        '3D':          { screen: 'Screen 4 — 3D',          times: ['11:15 AM','02:30 PM','05:45 PM','09:00 PM'] },
        'Dolby Atmos': { screen: 'Dolby Atmos Hall',       times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        'IMAX Laser':  { screen: 'IMAX Laser Hall',        times: ['09:45 AM','01:00 PM','04:15 PM','07:30 PM'] },
      },
    },
    {
      name: 'Cinepolis VIP Andheri',
      location: 'Fun Republic Mall, Andheri West, Mumbai',
      formats: {
        '2D':          { screen: 'Audi 1 — Classic',   times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: '3D Hall',             times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
        '4DX 3D':      { screen: '4DX 3D Arena',        times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'ScreenX':     { screen: 'ScreenX Theatre',     times: ['12:00 PM','03:15 PM','06:30 PM','09:30 PM'] },
      },
    },
    {
      name: 'Carnival Cinemas Wadala',
      location: 'R City Mall, Wadala, Mumbai',
      formats: {
        '2D':          { screen: 'Screen 1',     times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM'] },
        'RealD 3D':    { screen: 'RealD Hall',    times: ['11:00 AM','02:00 PM','05:00 PM','08:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // DELHI / NCR
  // ════════════════════════════════════════════════
  Delhi: [
    {
      name: 'PVR Select City Walk',
      location: 'Select Citywalk Mall, Saket, New Delhi',
      formats: {
        '2D':          { screen: 'Screen 1 — Classic',   times: ['09:30 AM','12:45 PM','03:45 PM','07:00 PM','10:15 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',        times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'IMAX 3D':     { screen: 'IMAX Hall',            times: ['09:00 AM','12:15 PM','03:30 PM','06:45 PM','09:45 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema Hall',    times: ['11:00 AM','02:00 PM','05:00 PM','08:00 PM'] },
        '4DX':         { screen: '4DX Hall',             times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'] },
      },
    },
    {
      name: 'INOX Nehru Place',
      location: 'DLF Place Mall, Saket, New Delhi',
      formats: {
        '2D':          { screen: 'Screen 1',       times: ['10:00 AM','01:00 PM','04:15 PM','07:30 PM','10:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',  times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'RealD 3D':    { screen: 'RealD Audi',     times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'Dolby Atmos': { screen: 'Dolby Hall',     times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
      },
    },
    {
      name: 'Cinepolis Pacific Mall',
      location: 'Pacific Mall, Tagore Garden, New Delhi',
      formats: {
        '2D':          { screen: 'Audi 1',          times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Audi 2 — 3D',     times: ['11:00 AM','02:30 PM','06:00 PM','09:00 PM'] },
        '4DX 3D':      { screen: '4DX 3D Arena',    times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'ScreenX':     { screen: 'ScreenX Hall',    times: ['12:00 PM','03:15 PM','07:00 PM'] },
      },
    },
    {
      name: 'PVR Ambience Mall Gurugram',
      location: 'Ambience Mall, DLF Phase 3, Gurugram',
      formats: {
        '2D':          { screen: 'Screen 1',      times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        'IMAX Laser':  { screen: 'IMAX Laser Hall', times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'] },
        '4DX':         { screen: '4DX Hall',      times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Hall',    times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // HYDERABAD
  // ════════════════════════════════════════════════
  Hyderabad: [
    {
      name: 'AMB Cinemas Gachibowli',
      location: 'AMB Mall, Gachibowli, Hyderabad',
      formats: {
        '2D':          { screen: 'Screen 1 — Premium',   times: ['09:00 AM','12:30 PM','03:45 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 3 — 3D',        times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'] },
        '4DX':         { screen: '4DX Hall',             times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'IMAX 3D':     { screen: 'IMAX Screen',          times: ['09:30 AM','12:45 PM','04:00 PM','07:15 PM','10:15 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema',         times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
      },
    },
    {
      name: 'PVR GSM Mall Kukatpally',
      location: 'GSM Mall, Kukatpally, Hyderabad',
      formats: {
        '2D':          { screen: 'Audi 1',          times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        '3D':          { screen: 'Audi 2 — 3D',     times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'Dolby Atmos': { screen: 'Dolby Hall',      times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '4K HDR':      { screen: '4K Hall',         times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'Cinepolis Inorbit Hyderabad',
      location: 'Inorbit Mall, HITEC City, Hyderabad',
      formats: {
        '2D':          { screen: 'Screen 1',        times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',  times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'RealD 3D':    { screen: 'RealD Hall',      times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
        'ScreenX':     { screen: 'ScreenX',         times: ['12:00 PM','03:00 PM','07:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // BENGALURU
  // ════════════════════════════════════════════════
  Bengaluru: [
    {
      name: 'PVR VR Mall Whitefield',
      location: 'VR Mall, Whitefield, Bengaluru',
      formats: {
        '2D':          { screen: 'Screen 1 — Classic',   times: ['09:15 AM','12:15 PM','03:30 PM','06:45 PM','09:45 PM'] },
        '3D':          { screen: '3D Screen',            times: ['10:15 AM','01:30 PM','04:45 PM','08:00 PM'] },
        'IMAX Laser':  { screen: 'IMAX Laser Hall',      times: ['09:45 AM','01:00 PM','04:15 PM','07:30 PM'] },
        '4DX 3D':      { screen: '4DX 3D Arena',         times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema',         times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
      },
    },
    {
      name: 'INOX Garuda Mall',
      location: 'Garuda Mall, Magrath Road, Bengaluru',
      formats: {
        '2D':          { screen: 'Screen 1',        times: ['10:00 AM','01:00 PM','04:00 PM','07:15 PM','10:15 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',  times: ['11:00 AM','02:15 PM','05:30 PM','08:30 PM'] },
        'ScreenX':     { screen: 'ScreenX Hall',   times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
        'Dolby Atmos': { screen: 'Dolby Atmos',    times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM','10:30 PM'] },
      },
    },
    {
      name: 'Cinepolis Nexus Shantiniketan',
      location: 'Nexus Shantiniketan Mall, Whitefield, Bengaluru',
      formats: {
        '2D':          { screen: 'Audi 1',       times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Audi 2 — 3D', times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        '4DX':         { screen: '4DX Arena',   times: ['11:30 AM','02:45 PM','06:00 PM','09:15 PM'] },
        'RealD 3D':    { screen: 'RealD Hall',  times: ['12:00 PM','03:15 PM','07:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // CHENNAI
  // ════════════════════════════════════════════════
  Chennai: [
    {
      name: 'PVR VR Chennai',
      location: 'VR Chennai Mall, Anna Nagar, Chennai',
      formats: {
        '2D':          { screen: 'Screen 1 — Classic',  times: ['09:30 AM','12:30 PM','03:45 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',       times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'IMAX 3D':     { screen: 'IMAX Hall',           times: ['09:00 AM','12:15 PM','03:30 PM','06:45 PM','09:45 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Cinema',        times: ['11:00 AM','02:00 PM','05:00 PM','08:00 PM'] },
      },
    },
    {
      name: 'INOX Bharat Mall',
      location: 'Bharat Mall, Ormes Road, Chennai',
      formats: {
        '2D':          { screen: 'Screen 1',      times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['11:00 AM','02:30 PM','06:00 PM','09:00 PM'] },
        'Dolby Atmos': { screen: 'Dolby Hall',   times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM'] },
        '4K HDR':      { screen: '4K Hall',       times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'Rohini Silver Screens',
      location: 'Anna Nagar West, Chennai',
      formats: {
        '2D':          { screen: 'Screen 1',      times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'RealD 3D':    { screen: 'RealD Audi',    times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // PUNE
  // ════════════════════════════════════════════════
  Pune: [
    {
      name: 'Cinepolis Pavilion Mall',
      location: 'Pavilion Mall, Nagar Road, Pune',
      formats: {
        '2D':          { screen: 'Audi 1 — Classic',  times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM','10:30 PM'] },
        '3D':          { screen: 'Audi 2 — 3D',       times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        '4DX':         { screen: '4DX Arena',          times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'RealD 3D':    { screen: 'RealD Hall',         times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'PVR Phoenix Market City Pune',
      location: 'Phoenix Market City, Viman Nagar, Pune',
      formats: {
        '2D':          { screen: 'Screen 1',        times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D',  times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'IMAX 3D':     { screen: 'IMAX Hall',       times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'] },
        'Dolby Atmos': { screen: 'Dolby Atmos',    times: ['11:30 AM','02:45 PM','06:00 PM','09:15 PM'] },
      },
    },
    {
      name: 'INOX Westend Mall Pune',
      location: 'Westend Mall, Aundh, Pune',
      formats: {
        '2D':          { screen: 'Screen 1',       times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'Dolby Cinema':{ screen: 'Dolby Hall',    times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM'] },
        'ScreenX':     { screen: 'ScreenX Hall',  times: ['12:00 PM','03:15 PM','07:00 PM'] },
      },
    },
  ],

  // ════════════════════════════════════════════════
  // KOLKATA
  // ════════════════════════════════════════════════
  Kolkata: [
    {
      name: 'PVR Acropolis Mall',
      location: 'Acropolis Mall, Kasba, Kolkata',
      formats: {
        '2D':          { screen: 'Screen 1',       times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'] },
        'Dolby Atmos': { screen: 'Dolby Hall',    times: ['10:30 AM','01:30 PM','04:30 PM','07:30 PM'] },
        'IMAX 3D':     { screen: 'IMAX Hall',     times: ['09:30 AM','12:45 PM','04:00 PM','07:15 PM'] },
      },
    },
    {
      name: 'INOX South City Mall',
      location: 'South City Mall, Prince Anwar Shah Road, Kolkata',
      formats: {
        '2D':          { screen: 'Screen 1',      times: ['09:30 AM','12:30 PM','03:30 PM','06:30 PM','09:30 PM'] },
        '3D':          { screen: 'Screen 2 — 3D', times: ['10:30 AM','01:45 PM','05:00 PM','08:00 PM'] },
        'RealD 3D':    { screen: 'RealD Hall',    times: ['11:30 AM','02:45 PM','06:00 PM','09:00 PM'] },
        '4K HDR':      { screen: '4K Hall',        times: ['12:00 PM','03:15 PM','06:30 PM'] },
      },
    },
    {
      name: 'Cinepolis Quest Mall',
      location: 'Quest Mall, Park Street, Kolkata',
      formats: {
        '2D':          { screen: 'Audi 1',       times: ['10:00 AM','01:00 PM','04:00 PM','07:00 PM','10:00 PM'] },
        '3D':          { screen: 'Audi 2 — 3D', times: ['11:00 AM','02:15 PM','05:30 PM','08:30 PM'] },
        '4DX 3D':      { screen: '4DX 3D Arena', times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'] },
        'ScreenX':     { screen: 'ScreenX Hall', times: ['12:00 PM','03:00 PM','07:00 PM'] },
      },
    },
  ],
};

// ─── MOVIES ───────────────────────────────────────────────────────────────────
const MOVIES_RAW = [
  // ─── NOW SHOWING ───
  {
    _id: '6ae010000000000000000001',
    title: 'Stree 2',
    language: 'Hindi',
    genre: ['Horror', 'Comedy', 'Thriller'],
    rating: 8.9,
    duration: 138,
    releaseDate: '2024-08-15',
    certification: 'UA',
    director: 'Amar Kaushik',
    description: 'The men of Chanderi are once again troubled by a supernatural entity — Sarkata, a headless ghost. Stree returns to face this new threat alongside Vicky and the gang in this hilarious horror sequel.',
    cast: [
      { name: 'Shraddha Kapoor', role: 'Stree', avatar: '' },
      { name: 'Rajkummar Rao',   role: 'Vicky', avatar: '' },
      { name: 'Aparshakti Khurrana', role: 'Bittu', avatar: '' },
      { name: 'Pankaj Tripathi', role: 'Jana', avatar: '' },
      { name: 'Tamannaah Bhatia', role: 'Special Appearance', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4woSOUD0equAYzvwhWBHIJDCM88.jpg',
    trailerUrl: 'https://www.youtube.com/embed/PbCHtjhCJXk',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000002',
    title: 'Jawan',
    language: 'Hindi',
    genre: ['Action', 'Thriller', 'Drama'],
    rating: 7.5,
    duration: 169,
    releaseDate: '2023-09-07',
    certification: 'UA',
    director: 'Atlee Kumar',
    description: 'A jail warden and his mother recruit a gang of women wronged by society to take on a ruthless businessman and the corruption that plagues the system.',
    cast: [
      { name: 'Shah Rukh Khan', role: 'Vikram / Azaad', avatar: '' },
      { name: 'Nayanthara',     role: 'Narmada', avatar: '' },
      { name: 'Vijay Sethupathi', role: 'Kalee', avatar: '' },
      { name: 'Deepika Padukone', role: 'Special Appearance', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/tFbfCkS7q6g96wVoAu8kyr93iPm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/6A3UaxbfpT2FpNsAqaVxT3bBHvL.jpg',
    trailerUrl: 'https://www.youtube.com/embed/m_g2KYGGrww',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000003',
    title: 'Animal',
    language: 'Hindi',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 7.2,
    duration: 201,
    releaseDate: '2023-12-01',
    certification: 'A',
    director: 'Sandeep Reddy Vanga',
    description: 'A violent, deeply devoted son returns home to take vengeance against those who have wronged his industrialist father. A raw and unapologetic saga of love, power, and revenge.',
    cast: [
      { name: 'Ranbir Kapoor', role: 'Ranvijay', avatar: '' },
      { name: 'Anil Kapoor',   role: 'Balbir', avatar: '' },
      { name: 'Rashmika Mandanna', role: 'Geetanjali', avatar: '' },
      { name: 'Bobby Deol',    role: 'Abrar', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/qNyYkE3bKT3cFwjG2n2XwC6ONOH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/embed/WhCFUbcoZlA',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000004',
    title: 'Fighter',
    language: 'Hindi',
    genre: ['Action', 'War', 'Drama'],
    rating: 6.8,
    duration: 167,
    releaseDate: '2024-01-25',
    certification: 'UA',
    director: 'Siddharth Anand',
    description: "India's first aerial action film featuring Indian Air Force pilots who risk everything to defend the nation's honor in a high-stakes conflict.",
    cast: [
      { name: 'Hrithik Roshan', role: 'Shamsher Pathania', avatar: '' },
      { name: 'Deepika Padukone', role: 'Minal Rathore', avatar: '' },
      { name: 'Anil Kapoor', role: 'Group Captain', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/2cKX1gMiSqYxHmA8nIHLBpOABuN.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/oFBcXLaPoJMzGHaHMa0aaFRmXKe.jpg',
    trailerUrl: 'https://www.youtube.com/embed/LJbj15msmMc',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000005',
    title: 'Pathaan',
    language: 'Hindi',
    genre: ['Action', 'Spy', 'Thriller'],
    rating: 7.0,
    duration: 146,
    releaseDate: '2023-01-25',
    certification: 'UA',
    director: 'Siddharth Anand',
    description: 'An exiled spy returns to India to battle a rogue former intelligence operative who has joined forces with a mercenary group plotting a biological attack on India.',
    cast: [
      { name: 'Shah Rukh Khan', role: 'Pathaan', avatar: '' },
      { name: 'Deepika Padukone', role: 'Rubina Mohsin', avatar: '' },
      { name: 'John Abraham', role: 'Jim', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/dVFIEZMbByHrSnBIWXBKSMhMEj4.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/h3jYanW8jvgl1T4R8RM2DFrDr4d.jpg',
    trailerUrl: 'https://www.youtube.com/embed/vqu4z34wENw',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000006',
    title: 'Pushpa 2: The Rule',
    language: 'Telugu',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 8.0,
    duration: 202,
    releaseDate: '2024-12-05',
    certification: 'A',
    director: 'Sukumar',
    description: "Pushpa Raj, the king of red sandalwood smuggling, rules the trade with an iron fist. When the government sends a determined cop and a powerful syndicate challenges his throne, Pushpa's rule faces its greatest test.",
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', avatar: '' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', avatar: '' },
      { name: 'Fahadh Faasil', role: 'Bhanwar Singh Shekawat', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/7Ec4RtRGGUXgGvNBqIzNv3FTDAV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/7Zt5DgZlsn1Y4bhRGqj6eEsNEG8.jpg',
    trailerUrl: 'https://www.youtube.com/embed/KLFmBYAaRoU',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000007',
    title: 'Kalki 2898 AD',
    language: 'Telugu',
    genre: ['Sci-Fi', 'Action', 'Mythology'],
    rating: 7.8,
    duration: 181,
    releaseDate: '2024-06-27',
    certification: 'UA',
    director: 'Nag Ashwin',
    description: 'Set in a dystopian future where mythology and science fiction merge, this epic tale follows the 10th avatar of Lord Vishnu in a world dominated by a tyrannical Supreme Yaskin.',
    cast: [
      { name: 'Prabhas', role: 'Bhairava / Kalki', avatar: '' },
      { name: 'Deepika Padukone', role: 'SUM-80 / Sumathi', avatar: '' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', avatar: '' },
      { name: 'Kamal Haasan', role: 'Supreme Yaskin', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/jhfWGLamN6BVSG4xeMRaIiJpXMw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tIL0yFXd3Rq8c3nOhwBbFxPOEVs.jpg',
    trailerUrl: 'https://www.youtube.com/embed/oBhAfbPAMsE',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000008',
    title: 'RRR',
    language: 'Telugu',
    genre: ['Action', 'Drama', 'Historical'],
    rating: 8.0,
    duration: 182,
    releaseDate: '2022-03-25',
    certification: 'UA',
    director: 'S. S. Rajamouli',
    description: 'A fictional story about two legendary Indian revolutionaries who fought against the British Raj and the Nizam of Hyderabad before commencing their journey of freedom struggle.',
    cast: [
      { name: 'N. T. Rama Rao Jr.', role: 'Komaram Bheem', avatar: '' },
      { name: 'Ram Charan', role: 'Alluri Sitarama Raju', avatar: '' },
      { name: 'Alia Bhatt', role: 'Sita', avatar: '' },
      { name: 'Ajay Devgn', role: 'Venkatrama Raju', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/wyDzKMpVFUKnvyOYkBEGGVz1Iow.jpg',
    trailerUrl: 'https://www.youtube.com/embed/f_vbAtFSEc0',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000009',
    title: 'Devara',
    language: 'Telugu',
    genre: ['Action', 'Drama', 'Thriller'],
    rating: 6.8,
    duration: 177,
    releaseDate: '2024-09-27',
    certification: 'UA',
    director: 'Koratala Siva',
    description: 'A fearless sea-lord terrorizes coastal criminals across generations, and his son must rise to his legacy when old enemies resurface.',
    cast: [
      { name: 'Jr. NTR', role: 'Devara / Vara', avatar: '' },
      { name: 'Janhvi Kapoor', role: 'Thangam', avatar: '' },
      { name: 'Saif Ali Khan', role: 'Bhaira', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/8Q0kkWIhKJFvZM0OIH8cV7mXU0g.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ovM06PdF3M8wvKb06i4sjW3xowY.jpg',
    trailerUrl: 'https://www.youtube.com/embed/XAx0MkzeSUw',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000010',
    title: 'Deadpool & Wolverine',
    language: 'English',
    genre: ['Action', 'Comedy', 'Superhero'],
    rating: 7.8,
    duration: 128,
    releaseDate: '2024-07-26',
    certification: 'A',
    director: 'Shawn Levy',
    description: "Deadpool is rejected by the TVA and forms an unlikely alliance with Wolverine to save the world. The duo's chaotic chemistry across the multiverse leads to an explosive adventure.",
    cast: [
      { name: 'Ryan Reynolds', role: 'Deadpool / Wade Wilson', avatar: '' },
      { name: 'Hugh Jackman', role: 'Wolverine / Logan', avatar: '' },
      { name: 'Emma Corrin', role: 'Cassandra Nova', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000011',
    title: 'Dune: Part Two',
    language: 'English',
    genre: ['Sci-Fi', 'Adventure', 'Epic'],
    rating: 8.5,
    duration: 167,
    releaseDate: '2024-03-01',
    certification: 'UA',
    director: 'Denis Villeneuve',
    description: 'Paul Atreides unites with the Fremen to take his revenge against the conspirators who destroyed his family. He faces a choice between his love and the fate of the universe.',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', avatar: '' },
      { name: 'Zendaya', role: 'Chani', avatar: '' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', avatar: '' },
      { name: 'Austin Butler', role: 'Feyd-Rautha', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tm2fqSPh1qX3XPDC3k3Gb6FsCul.jpg',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000012',
    title: 'Oppenheimer',
    language: 'English',
    genre: ['Biography', 'Drama', 'History'],
    rating: 8.3,
    duration: 180,
    releaseDate: '2023-07-21',
    certification: 'UA',
    director: 'Christopher Nolan',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II — and the moral reckoning that followed.',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', avatar: '' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', avatar: '' },
      { name: 'Matt Damon', role: 'Gen. Leslie Groves', avatar: '' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000013',
    title: 'Gladiator II',
    language: 'English',
    genre: ['Action', 'Adventure', 'Historical'],
    rating: 7.0,
    duration: 148,
    releaseDate: '2024-11-22',
    certification: 'UA',
    director: 'Ridley Scott',
    description: 'Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum after his home is conquered by tyrants who now lead Rome with an iron fist.',
    cast: [
      { name: 'Paul Mescal', role: 'Lucius', avatar: '' },
      { name: 'Pedro Pascal', role: 'Acacius', avatar: '' },
      { name: 'Denzel Washington', role: 'Macrinus', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/4kHGHCFkBxLjl0XnANZUEL7ZQMR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbnd8qnd.jpg',
    trailerUrl: 'https://www.youtube.com/embed/OnBcaQRR2s0',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000014',
    title: 'Inside Out 2',
    language: 'English',
    genre: ['Animation', 'Family', 'Comedy'],
    rating: 7.8,
    duration: 100,
    releaseDate: '2024-06-14',
    certification: 'U',
    director: 'Kelsey Mann',
    description: "Riley enters puberty and new emotions — Anxiety, Envy, Ennui — crowd the headquarters. Joy and her team must work together to restore balance in Riley's evolving mind.",
    cast: [
      { name: 'Amy Poehler', role: 'Joy (Voice)', avatar: '' },
      { name: 'Maya Hawke', role: 'Anxiety (Voice)', avatar: '' },
      { name: 'Ayo Edebiri', role: 'Envy (Voice)', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/vpnVM9Bkh6cJt2GQCXIy5VY5O6n.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg',
    trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000015',
    title: 'The Batman',
    language: 'English',
    genre: ['Action', 'Crime', 'Thriller'],
    rating: 7.8,
    duration: 176,
    releaseDate: '2022-03-04',
    certification: 'UA',
    director: 'Matt Reeves',
    description: "In Batman's second year of fighting crime, he uncovers corruption in Gotham City while pursuing a serial killer known as the Riddler.",
    cast: [
      { name: 'Robert Pattinson', role: 'Batman / Bruce Wayne', avatar: '' },
      { name: 'Zoë Kravitz', role: 'Catwoman / Selina Kyle', avatar: '' },
      { name: 'Paul Dano', role: 'The Riddler', avatar: '' },
      { name: 'Colin Farrell', role: 'The Penguin', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000016',
    title: 'Bhool Bhulaiyaa 3',
    language: 'Hindi',
    genre: ['Horror', 'Comedy', 'Mystery'],
    rating: 6.9,
    duration: 145,
    releaseDate: '2024-11-01',
    certification: 'UA',
    director: 'Anees Bazmee',
    description: "Rooh Baba returns for another terrifyingly funny haunted encounter when two ancient spirits clash in Manjulika's cursed haveli.",
    cast: [
      { name: 'Kartik Aaryan', role: 'Rooh Baba', avatar: '' },
      { name: 'Vidya Balan', role: 'Manjulika', avatar: '' },
      { name: 'Madhuri Dixit', role: 'Batuk Maharaj', avatar: '' },
      { name: 'Triptii Dimri', role: 'Sifra', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/uVlUu174iiKhsUGqnOSy46eIIMU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    trailerUrl: 'https://www.youtube.com/embed/TlLQrHi8R8Q',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000017',
    title: 'Leo',
    language: 'Tamil',
    genre: ['Action', 'Thriller', 'Crime'],
    rating: 7.5,
    duration: 164,
    releaseDate: '2023-10-19',
    certification: 'UA',
    director: 'Lokesh Kanagaraj',
    description: 'A mild-mannered café owner is forced to confront his hidden violent past when gangsters come after him, unleashing a ruthless side the world never expected.',
    cast: [
      { name: 'Vijay', role: 'Parthiban / Leo Das', avatar: '' },
      { name: 'Trisha Krishnan', role: 'Sathya', avatar: '' },
      { name: 'Sanjay Dutt', role: 'Antony Das', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/6X2YjjH3mywKfTHbOCpQAnMGpCS.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/gS3MjxHFRG7SICBISrEjbwJNQvU.jpg',
    trailerUrl: 'https://www.youtube.com/embed/BHdEpwTd2Gk',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000018',
    title: 'Singham Returns',
    language: 'Hindi',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 6.5,
    duration: 155,
    releaseDate: '2024-08-15',
    certification: 'UA',
    director: 'Rohit Shetty',
    description: 'Bajirao Singham faces a new and powerful network of criminals backed by political powers. With his cop-universe heroes, he must dismantle the most dangerous conspiracy in his career.',
    cast: [
      { name: 'Ajay Devgn', role: 'Bajirao Singham', avatar: '' },
      { name: 'Kareena Kapoor Khan', role: 'Avni Singh', avatar: '' },
      { name: 'Deepika Padukone', role: 'Shakti Shetty', avatar: '' },
      { name: 'Tiger Shroff', role: 'Satya', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/m3nDSzJD7HXUm5j2HCJJLQo6PSH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
    trailerUrl: 'https://www.youtube.com/embed/S3pCEQxXEDk',
    status: 'NOW_SHOWING',
  },
  {
    _id: '6ae010000000000000000019',
    title: 'Venom: The Last Dance',
    language: 'English',
    genre: ['Action', 'Sci-Fi', 'Superhero'],
    rating: 6.4,
    duration: 109,
    releaseDate: '2024-10-25',
    certification: 'UA',
    director: 'Kelly Marcel',
    description: "Eddie Brock and Venom are on the run, hunted by both sides. A spectacular and emotional farewell to Marvel's lethal protector.",
    cast: [
      { name: 'Tom Hardy', role: 'Eddie Brock / Venom', avatar: '' },
      { name: 'Chiwetel Ejiofor', role: 'Rex Strickland', avatar: '' },
      { name: 'Juno Temple', role: 'Dr. Paige', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
    trailerUrl: 'https://www.youtube.com/embed/q-wE8-VgRGA',
    status: 'NOW_SHOWING',
  },
  // ─── COMING SOON ───
  {
    _id: '6ae010000000000000000020',
    title: 'Ramayana: Part 1',
    language: 'Hindi',
    genre: ['Mythology', 'Drama', 'Epic'],
    rating: null,
    duration: 180,
    releaseDate: '2025-01-26',
    certification: 'U',
    director: 'Nitesh Tiwari',
    description: 'The grandest retelling of the Hindu epic — Ramayana. Follow Lord Ram from Ayodhya to Lanka in a breathtaking visual spectacle of love, duty, sacrifice, and the eternal battle between good and evil.',
    cast: [
      { name: 'Ranbir Kapoor', role: 'Lord Ram', avatar: '' },
      { name: 'Sai Pallavi', role: 'Sita', avatar: '' },
      { name: 'Yash', role: 'Ravana', avatar: '' },
      { name: 'Sunny Deol', role: 'Hanuman', avatar: '' },
    ],
    posterUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/JGhDB7PZFRY',
    status: 'COMING_SOON',
  },
  {
    _id: '6ae010000000000000000021',
    title: 'Godzilla Minus One',
    language: 'Japanese',
    genre: ['Sci-Fi', 'Disaster', 'Action'],
    rating: 8.1,
    duration: 124,
    releaseDate: '2024-12-27',
    certification: 'UA',
    director: 'Takashi Yamazaki',
    description: 'Post-war Japan is at its lowest point when Godzilla arises. Stripped of all resources, the people of Japan must rise together against the terrifying monster.',
    cast: [
      { name: 'Ryunosuke Kamiki', role: 'Kōichi Shikishima', avatar: '' },
      { name: 'Minami Hamabe', role: 'Noriko Ōishi', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/6A4GTfS3GimJiqxWaE5iFwXvNKw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ie7aQjCKIi91WRQB0lGEhk0Pl19.jpg',
    trailerUrl: 'https://www.youtube.com/embed/InfKAbwvY6s',
    status: 'COMING_SOON',
  },
  {
    _id: '6ae010000000000000000022',
    title: 'War 2',
    language: 'Hindi',
    genre: ['Action', 'Spy', 'Thriller'],
    rating: null,
    duration: 160,
    releaseDate: '2025-08-14',
    certification: 'UA',
    director: 'Ayan Mukerji',
    description: 'The highly-anticipated sequel to War. Kabir faces off against a new enemy even more powerful than himself — a charismatic spy who has turned rogue and threatens global security.',
    cast: [
      { name: 'Hrithik Roshan', role: 'Kabir', avatar: '' },
      { name: 'Jr. NTR', role: 'Rival', avatar: '' },
      { name: 'Kiara Advani', role: 'Lead', avatar: '' },
    ],
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/4VfT3P87dRE',
    status: 'COMING_SOON',
  },
  {
    _id: '6ae010000000000000000023',
    title: 'Kalki 2898 AD: Part 2',
    language: 'Telugu',
    genre: ['Sci-Fi', 'Action', 'Mythology'],
    rating: null,
    duration: 175,
    releaseDate: '2025-05-01',
    certification: 'UA',
    director: 'Nag Ashwin',
    description: 'The continuation of the Kalki saga. The 10th avatar of Vishnu rises to full power as the battle against Supreme Yaskin reaches its apocalyptic climax.',
    cast: [
      { name: 'Prabhas', role: 'Kalki', avatar: '' },
      { name: 'Deepika Padukone', role: 'Sumathi', avatar: '' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/jhfWGLamN6BVSG4xeMRaIiJpXMw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tIL0yFXd3Rq8c3nOhwBbFxPOEVs.jpg',
    trailerUrl: 'https://www.youtube.com/embed/oBhAfbPAMsE',
    status: 'COMING_SOON',
  },
  {
    _id: '6ae010000000000000000024',
    title: 'Avatar: Fire and Ash',
    language: 'English',
    genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
    rating: null,
    duration: 190,
    releaseDate: '2025-12-19',
    certification: 'UA',
    director: 'James Cameron',
    description: "Jake Sully and Neytiri face their greatest challenge yet as a new volcanic clan threatens the peace of Pandora. The Sully family must unite with unexpected allies to save their world.",
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully', avatar: '' },
      { name: 'Zoe Saldana', role: 'Neytiri', avatar: '' },
      { name: 'Sigourney Weaver', role: 'Kiri', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/AmR3JfkerDef8o5UY7ZQs7MBER8.jpg',
    trailerUrl: 'https://www.youtube.com/embed/a8Gx8wiNbs8',
    status: 'COMING_SOON',
  },
];

// ─── SHOWTIME GENERATOR ───────────────────────────────────────────────────────
// Distributes realistic city-specific showtimes without exceeding memory limits
function generateShowtimes(movies, cities, dates) {
  const showtimes = [];
  let stIdNum = 1;

  // Blockbusters that get maximum screen coverage in Indore & metro cities
  const blockbusters = [
    'Stree 2', 'Jawan', 'Animal', 'Pushpa 2: The Rule', 'Kalki 2898 AD',
    'Deadpool & Wolverine', 'Dune: Part Two', 'Fighter', 'Pathaan', 'Bhool Bhulaiyaa 3'
  ];

  for (let mIdx = 0; mIdx < movies.length; mIdx++) {
    const movie = movies[mIdx];
    if (movie.status !== 'NOW_SHOWING') continue;

    const isBlockbuster = blockbusters.includes(movie.title);

    for (const [cityName, cityTheaters] of Object.entries(cities)) {
      // For Indore: show in 3 to 4 theaters if blockbuster, else 2 theaters
      // For other cities: show in 1 to 2 theaters
      let theaterCount;
      if (cityName === 'Indore') {
        theaterCount = isBlockbuster ? Math.min(4, cityTheaters.length) : Math.min(2, cityTheaters.length);
      } else if (cityName === 'Mumbai' || cityName === 'Delhi') {
        theaterCount = isBlockbuster ? 2 : 1;
      } else {
        theaterCount = 1;
      }

      // Pick theaters in rotation based on movie index so all theaters get used
      const chosenTheaters = [];
      for (let t = 0; t < theaterCount; t++) {
        const tIndex = (mIdx + t) % cityTheaters.length;
        chosenTheaters.push(cityTheaters[tIndex]);
      }

      for (const theater of chosenTheaters) {
        const availableFormats = Object.entries(theater.formats);
        // Pick 1 to 2 formats per theater (e.g. 3D + 2D or IMAX + 4DX)
        const formatCount = isBlockbuster && availableFormats.length > 1 ? 2 : 1;
        const selectedFormats = availableFormats.slice(0, formatCount);

        for (const [format, { screen, times }] of selectedFormats) {
          // Pick 2 showtimes per day (e.g., afternoon and prime evening)
          const chosenTimes = times.length > 2 
            ? [times[1], times[times.length - 2]] 
            : times.slice(0, 2);

          for (const date of dates) {
            for (const time of chosenTimes) {
              const stId = stIdNum.toString(16).padStart(24, '0');
              stIdNum++;

              const seats = generateSeats(format);
              const bookedCount = seats.filter(s => s.isBooked).length;
              const prices = FORMAT_PRICES[format] || FORMAT_PRICES['2D'];

              showtimes.push({
                _id: stId,
                movieId: movie._id,
                cinemaName: theater.name,
                theaterName: theater.name,
                location: theater.location,
                city: cityName,
                screen,
                format,
                date,
                time,
                language: movie.language,
                seats,
                availableSeatsCount: seats.length - bookedCount,
                totalSeatsCount: seats.length,
                pricing: {
                  standard: prices.BUDGET,
                  premium: prices.PREMIUM,
                  recliner: prices.RECLINER,
                },
              });
            }
          }
        }
      }
    }
  }

  return showtimes;
}

// ─── GENERATE & WRITE ─────────────────────────────────────────────────────────
const movies    = MOVIES_RAW;
const showtimes = generateShowtimes(movies, CITIES, SHOW_DATES);

const catalog = { movies, showtimes };
const json    = JSON.stringify(catalog, null, 2);

writeFileSync('api/catalogData.json',        json, 'utf8');
writeFileSync('client/api/catalogData.json', json, 'utf8');

console.log('✅ Catalog v2 successfully generated!');
console.log(`   Movies     : ${movies.length}`);
console.log(`   Showtimes  : ${showtimes.length}`);
console.log(`   Cities     : ${Object.keys(CITIES).join(', ')}`);
console.log(`   Dates      : ${SHOW_DATES.join(', ')}`);

// Print per-city theater summary
for (const [city, theaters] of Object.entries(CITIES)) {
  const cityShowtimes = showtimes.filter(s => s.city === city);
  console.log(`   ${city.padEnd(12)}: ${theaters.length} theaters, ${cityShowtimes.length} showtimes (${theaters.map(t => t.name).join(', ')})`);
}

