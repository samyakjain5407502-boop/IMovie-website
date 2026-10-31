/**
 * generateCatalog.js
 * Generates a complete catalogData.json with:
 * - 24 movies (real TMDB poster URLs)
 * - Real Indian theaters including Indore (TI Mall INOX, PVR C21, Cinepolis Orbit, etc.)
 * - All screen formats: 2D, 3D, IMAX 3D, IMAX Laser, Dolby Cinema, 4DX, 4DX 3D, ScreenX, Dolby Atmos, 4K HDR, RealD 3D
 * - Format-based pricing tiers: BUDGET, PREMIUM, RECLINER
 * - 7 show dates from today
 * Run: node generateCatalog.js
 */

import { writeFileSync } from 'fs';

// ─── HELPER: ObjectId-like string ──────────────────────────────────────────
let _idCounter = 1;
function makeId(prefix = '') {
  const hex = (_idCounter++).toString(16).padStart(24, '0');
  return hex;
}

// ─── DATES: next 7 days ─────────────────────────────────────────────────────
function getNextDates(count = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const SHOW_DATES = getNextDates(7);

// ─── FORMATS & PRICING ──────────────────────────────────────────────────────
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

// ─── SEAT GENERATION ────────────────────────────────────────────────────────
function generateSeats(format) {
  const prices = FORMAT_PRICES[format] || FORMAT_PRICES['2D'];
  const seats = [];
  // Rows A-C: BUDGET (rows near back), D-F: PREMIUM, G-H: RECLINER (front premium)
  const ROWS = ['A','B','C','D','E','F','G','H'];
  const TIER_MAP = { A:'BUDGET', B:'BUDGET', C:'BUDGET', D:'PREMIUM', E:'PREMIUM', F:'PREMIUM', G:'RECLINER', H:'RECLINER' };
  const COLS = 12;

  for (const row of ROWS) {
    const tier = TIER_MAP[row];
    const price = prices[tier];
    for (let col = 1; col <= COLS; col++) {
      const rand = Math.random();
      const isBooked = rand < 0.22; // ~22% booked initially
      seats.push({
        seatNumber: `${row}${col}`,
        row,
        col,
        tier,
        price,
        isBooked,
      });
    }
  }
  return seats;
}

// ─── THEATERS ────────────────────────────────────────────────────────────────
// Each theater has: name, location, city, supportedFormats, times
const THEATERS = [
  // ═══ INDORE ═══
  {
    name: 'INOX TI Mall',
    location: 'Treasure Island Mall, MG Road, Indore',
    city: 'Indore',
    formats: ['2D','3D','Dolby Atmos','IMAX 3D','4DX'],
    times: ['09:30 AM','12:45 PM','04:00 PM','07:15 PM','10:30 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2 - 3D Hall', 'Dolby Atmos':'Dolby Auditorium', 'IMAX 3D':'IMAX Screen', '4DX':'4DX Arena' },
  },
  {
    name: 'PVR C21 Mall',
    location: 'C21 Mall, AB Road, Indore',
    city: 'Indore',
    formats: ['2D','3D','Dolby Cinema','RealD 3D'],
    times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', 'Dolby Cinema':'Dolby Cinema Hall', 'RealD 3D':'RealD Auditorium' },
  },
  {
    name: 'Cinepolis Orbit Mall',
    location: 'Orbit Mall, Vijay Nagar, Indore',
    city: 'Indore',
    formats: ['2D','3D','4DX 3D','ScreenX'],
    times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'],
    screens: { '2D':'Audi 1', '3D':'Audi 2 - 3D', '4DX 3D':'4DX Arena', 'ScreenX':'ScreenX Hall' },
  },
  {
    name: 'INOX MR-10 Square',
    location: 'MR-10 Square Mall, Indore',
    city: 'Indore',
    formats: ['2D','3D','4K HDR'],
    times: ['11:00 AM','02:30 PM','05:45 PM','09:00 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', '4K HDR':'4K Premium Hall' },
  },
  {
    name: 'Fun Cinemas Indore',
    location: 'C21 Mall, Ring Road, Indore',
    city: 'Indore',
    formats: ['2D','3D'],
    times: ['10:00 AM','01:00 PM','04:00 PM','07:30 PM','10:00 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 3' },
  },
  // ═══ MUMBAI ═══
  {
    name: 'PVR ICON Phoenix Palladium',
    location: 'Phoenix Palladium Mall, Lower Parel, Mumbai',
    city: 'Mumbai',
    formats: ['2D','3D','IMAX 3D','Dolby Cinema','4DX'],
    times: ['09:00 AM','12:00 PM','03:30 PM','06:45 PM','09:45 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 3', 'IMAX 3D':'IMAX Auditorium', 'Dolby Cinema':'Dolby Cinema Hall', '4DX':'4DX Experience' },
  },
  {
    name: 'INOX Megaplex Inorbit Mall',
    location: 'Inorbit Mall, Malad West, Mumbai',
    city: 'Mumbai',
    formats: ['2D','3D','Dolby Atmos','IMAX Laser'],
    times: ['10:15 AM','01:30 PM','04:45 PM','08:00 PM'],
    screens: { '2D':'Screen 2', '3D':'Screen 4 - 3D', 'Dolby Atmos':'Dolby Atmos Hall', 'IMAX Laser':'IMAX Laser Hall' },
  },
  {
    name: 'Cinepolis VIP Andheri',
    location: 'Fun Republic Mall, Andheri West, Mumbai',
    city: 'Mumbai',
    formats: ['2D','3D','4DX 3D','ScreenX'],
    times: ['11:00 AM','02:15 PM','05:30 PM','08:45 PM'],
    screens: { '2D':'Audi 1', '3D':'3D Hall', '4DX 3D':'4DX Arena', 'ScreenX':'ScreenX' },
  },
  // ═══ DELHI ═══
  {
    name: 'PVR Select City Walk',
    location: 'Select Citywalk Mall, Saket, New Delhi',
    city: 'Delhi',
    formats: ['2D','3D','IMAX 3D','Dolby Cinema','4DX'],
    times: ['09:30 AM','12:45 PM','03:45 PM','07:00 PM','10:15 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', 'IMAX 3D':'IMAX Hall', 'Dolby Cinema':'Dolby Hall', '4DX':'4DX' },
  },
  {
    name: 'INOX Nehru Place',
    location: 'DLF Place, Saket / Nehru Place, New Delhi',
    city: 'Delhi',
    formats: ['2D','3D','RealD 3D','Dolby Atmos'],
    times: ['10:00 AM','01:00 PM','04:15 PM','07:30 PM','10:30 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', 'RealD 3D':'RealD Audi', 'Dolby Atmos':'Dolby Hall' },
  },
  // ═══ HYDERABAD ═══
  {
    name: 'AMB Cinemas Gachibowli',
    location: 'AMB Mall, Gachibowli, Hyderabad',
    city: 'Hyderabad',
    formats: ['2D','3D','4DX','IMAX 3D','Dolby Cinema'],
    times: ['09:00 AM','12:30 PM','03:45 PM','07:00 PM','10:00 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 3', '4DX':'4DX Hall', 'IMAX 3D':'IMAX', 'Dolby Cinema':'Dolby' },
  },
  {
    name: 'PVR Kukatpally',
    location: 'GSM Mall, Kukatpally, Hyderabad',
    city: 'Hyderabad',
    formats: ['2D','3D','Dolby Atmos','4K HDR'],
    times: ['10:30 AM','01:45 PM','05:00 PM','08:15 PM'],
    screens: { '2D':'Audi 1', '3D':'Audi 2', 'Dolby Atmos':'Dolby Hall', '4K HDR':'4K Hall' },
  },
  // ═══ BANGALORE ═══
  {
    name: 'PVR VR Mall Whitefield',
    location: 'VR Mall, Whitefield, Bengaluru',
    city: 'Bengaluru',
    formats: ['2D','3D','IMAX Laser','4DX 3D','Dolby Cinema'],
    times: ['09:15 AM','12:15 PM','03:30 PM','06:45 PM','09:45 PM'],
    screens: { '2D':'Screen 1', '3D':'3D Screen', 'IMAX Laser':'IMAX Laser', '4DX 3D':'4DX 3D Arena', 'Dolby Cinema':'Dolby' },
  },
  {
    name: 'INOX Garuda Mall',
    location: 'Garuda Mall, Magrath Road, Bengaluru',
    city: 'Bengaluru',
    formats: ['2D','3D','ScreenX','Dolby Atmos'],
    times: ['10:00 AM','01:00 PM','04:00 PM','07:15 PM','10:15 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', 'ScreenX':'ScreenX Hall', 'Dolby Atmos':'Dolby Atmos' },
  },
  // ═══ CHENNAI ═══
  {
    name: 'PVR VR Chennai',
    location: 'VR Chennai Mall, Anna Nagar, Chennai',
    city: 'Chennai',
    formats: ['2D','3D','IMAX 3D','Dolby Cinema'],
    times: ['09:30 AM','12:30 PM','03:45 PM','07:00 PM','10:00 PM'],
    screens: { '2D':'Screen 1', '3D':'Screen 2', 'IMAX 3D':'IMAX Hall', 'Dolby Cinema':'Dolby' },
  },
  // ═══ PUNE ═══
  {
    name: 'Cinepolis Pavilion Mall',
    location: 'Pavilion Mall, Nagar Road, Pune',
    city: 'Pune',
    formats: ['2D','3D','4DX','RealD 3D'],
    times: ['10:00 AM','01:15 PM','04:30 PM','07:45 PM'],
    screens: { '2D':'Audi 1', '3D':'Audi 2', '4DX':'4DX', 'RealD 3D':'RealD' },
  },
];

// ─── MOVIES ──────────────────────────────────────────────────────────────────
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
    description: 'The men of Chanderi are once again troubled by a supernatural entity — this time, Sarkata, a headless ghost. Stree returns to face this new threat alongside Vicky and the gang in this hilarious horror sequel.',
    cast: [
      { name: 'Shraddha Kapoor', role: 'Stree', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Shraddha_Kapoor_at_Haider_Movie_Promotions.jpg/220px-Shraddha_Kapoor_at_Haider_Movie_Promotions.jpg' },
      { name: 'Rajkummar Rao', role: 'Vicky', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Rajkummar_Rao_at_a_promotional_event_%28cropped%29.jpg/220px-Rajkummar_Rao_at_a_promotional_event_%28cropped%29.jpg' },
      { name: 'Aparshakti Khurrana', role: 'Bittu', avatar: '' },
      { name: 'Pankaj Tripathi', role: 'Jana', avatar: '' },
      { name: 'Tamannaah Bhatia', role: 'Special Appearance', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4woSOUD0equAYzvwhWBHIJDCM88.jpg',
    trailerUrl: 'https://www.youtube.com/embed/PbCHtjhCJXk',
    status: 'NOW_SHOWING',
    theatersAssigned: ['INOX TI Mall','PVR C21 Mall','Cinepolis Orbit Mall','PVR ICON Phoenix Palladium','PVR Select City Walk','AMB Cinemas Gachibowli'],
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
      { name: 'Nayanthara', role: 'Narmada', avatar: '' },
      { name: 'Vijay Sethupathi', role: 'Kalee', avatar: '' },
      { name: 'Deepika Padukone', role: 'Special Appearance', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/tFbfCkS7q6g96wVoAu8kyr93iPm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/6A3UaxbfpT2FpNsAqaVxT3bBHvL.jpg',
    trailerUrl: 'https://www.youtube.com/embed/m_g2KYGGrww',
    status: 'NOW_SHOWING',
    theatersAssigned: ['INOX TI Mall','PVR C21 Mall','INOX MR-10 Square','PVR ICON Phoenix Palladium','INOX Nehru Place','PVR Kukatpally'],
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
      { name: 'Anil Kapoor', role: 'Balbir', avatar: '' },
      { name: 'Rashmika Mandanna', role: 'Geetanjali', avatar: '' },
      { name: 'Bobby Deol', role: 'Abrar', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/qNyYkE3bKT3cFwjG2n2XwC6ONOH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/embed/WhCFUbcoZlA',
    status: 'NOW_SHOWING',
    theatersAssigned: ['Cinepolis Orbit Mall','INOX MR-10 Square','Fun Cinemas Indore','INOX Megaplex Inorbit Mall','PVR VR Mall Whitefield'],
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
    theatersAssigned: ['INOX TI Mall','PVR C21 Mall','PVR ICON Phoenix Palladium','PVR Select City Walk','INOX Garuda Mall'],
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
    theatersAssigned: ['Cinepolis Orbit Mall','INOX MR-10 Square','INOX Megaplex Inorbit Mall','INOX Nehru Place','PVR Kukatpally'],
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
    theatersAssigned: ['INOX TI Mall','PVR C21 Mall','Cinepolis Orbit Mall','AMB Cinemas Gachibowli','PVR VR Chennai','Cinepolis Pavilion Mall'],
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
    theatersAssigned: ['INOX TI Mall','AMB Cinemas Gachibowli','PVR VR Chennai','PVR VR Mall Whitefield','INOX Garuda Mall','INOX Megaplex Inorbit Mall'],
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
    description: 'A fictional story about two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, who fought against the British Raj and the Nizam of Hyderabad before commencing their journey of freedom struggle.',
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
    theatersAssigned: ['PVR C21 Mall','Fun Cinemas Indore','AMB Cinemas Gachibowli','PVR Kukatpally','INOX Garuda Mall'],
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
    theatersAssigned: ['Cinepolis Orbit Mall','AMB Cinemas Gachibowli','PVR VR Chennai','Cinepolis VIP Andheri'],
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
    description: "Deadpool is rejected by the TVA and forms an unlikely alliance with Wolverine to save the world. The duo's chaotic chemistry across the multiverse leads to an explosive, fourth-wall-breaking adventure.",
    cast: [
      { name: 'Ryan Reynolds', role: 'Deadpool / Wade Wilson', avatar: '' },
      { name: 'Hugh Jackman', role: 'Wolverine / Logan', avatar: '' },
      { name: 'Emma Corrin', role: 'Cassandra Nova', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk',
    status: 'NOW_SHOWING',
    theatersAssigned: ['INOX TI Mall','PVR ICON Phoenix Palladium','PVR Select City Walk','PVR VR Mall Whitefield','PVR VR Chennai'],
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
    theatersAssigned: ['PVR C21 Mall','PVR ICON Phoenix Palladium','PVR Select City Walk','AMB Cinemas Gachibowli','INOX Garuda Mall'],
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
    theatersAssigned: ['INOX TI Mall','INOX MR-10 Square','INOX Megaplex Inorbit Mall','PVR Select City Walk','PVR VR Mall Whitefield'],
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
      { name: 'Connie Nielsen', role: 'Lucilla', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/4kHGHCFkBxLjl0XnANZUEL7ZQMR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbnd8qnd.jpg',
    trailerUrl: 'https://www.youtube.com/embed/OnBcaQRR2s0',
    status: 'NOW_SHOWING',
    theatersAssigned: ['PVR C21 Mall','Cinepolis VIP Andheri','INOX Nehru Place','PVR Kukatpally','PVR VR Chennai'],
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
    description: "Riley enters puberty and new emotions — Anxiety, Envy, Ennui, Embarrassment, and Nostalgia — crowd the headquarters. Joy and her team must work together to restore balance in Riley's evolving mind.",
    cast: [
      { name: 'Amy Poehler', role: 'Joy (Voice)', avatar: '' },
      { name: 'Maya Hawke', role: 'Anxiety (Voice)', avatar: '' },
      { name: 'Ayo Edebiri', role: 'Envy (Voice)', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/vpnVM9Bkh6cJt2GQCXIy5VY5O6n.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg',
    trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0',
    status: 'NOW_SHOWING',
    theatersAssigned: ['Fun Cinemas Indore','Cinepolis Pavilion Mall','INOX Garuda Mall','INOX Nehru Place','PVR Select City Walk'],
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
    description: "In Batman's second year of fighting crime, he uncovers corruption in Gotham City while pursuing a serial killer known as the Riddler. As evidence leads closer to home, Bruce Wayne's own dark secrets are threatened.",
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
    theatersAssigned: ['INOX TI Mall','Cinepolis Orbit Mall','PVR ICON Phoenix Palladium','INOX Garuda Mall'],
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
    description: 'Rooh Baba returns for another terrifyingly funny haunted encounter when two ancient spirits clash and only one can prevail. The mystery deepens with every twist in Manjulika\'s cursed haveli.',
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
    theatersAssigned: ['PVR C21 Mall','INOX MR-10 Square','Fun Cinemas Indore','Cinepolis VIP Andheri','PVR Select City Walk','PVR Kukatpally'],
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
    theatersAssigned: ['AMB Cinemas Gachibowli','PVR VR Chennai','Cinepolis Pavilion Mall','Cinepolis Orbit Mall'],
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
    description: 'Bajirao Singham faces a new and powerful network of criminals backed by political powers. With his team of cop-universe heroes, he must dismantle the most dangerous conspiracy in his career.',
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
    theatersAssigned: ['INOX TI Mall','PVR C21 Mall','INOX MR-10 Square','INOX Megaplex Inorbit Mall','INOX Nehru Place'],
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
    description: "Eddie Brock and Venom are on the run. Hunted by both sides, they make one final fateful decision that brings down their worlds — a spectacular and emotional farewell to Marvel's lethal protector.",
    cast: [
      { name: 'Tom Hardy', role: 'Eddie Brock / Venom', avatar: '' },
      { name: 'Chiwetel Ejiofor', role: 'Rex Strickland', avatar: '' },
      { name: 'Juno Temple', role: 'Dr. Paige', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
    trailerUrl: 'https://www.youtube.com/embed/q-wE8-VgRGA',
    status: 'NOW_SHOWING',
    theatersAssigned: ['Fun Cinemas Indore','Cinepolis Orbit Mall','PVR ICON Phoenix Palladium','Cinepolis VIP Andheri','PVR VR Mall Whitefield'],
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
    posterUrl: 'https://image.tmdb.org/t/p/original/9Rq9QfGT6Lz3WuVSdkS0V7oEQB8.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/JGhDB7PZFRY',
    status: 'COMING_SOON',
    theatersAssigned: [],
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
    description: 'Post-war Japan is at its lowest point when a new dangerous threat arises — Godzilla. Stripped of all resources, the people of Japan must rise together against the terrifying monster in this critically-acclaimed kaiju epic.',
    cast: [
      { name: 'Ryunosuke Kamiki', role: 'Kōichi Shikishima', avatar: '' },
      { name: 'Minami Hamabe', role: 'Noriko Ōishi', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/6A4GTfS3GimJiqxWaE5iFwXvNKw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ie7aQjCKIi91WRQB0lGEhk0Pl19.jpg',
    trailerUrl: 'https://www.youtube.com/embed/InfKAbwvY6s',
    status: 'COMING_SOON',
    theatersAssigned: [],
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
      { name: 'Jr. NTR', role: 'Villain / Rival', avatar: '' },
      { name: 'Kiara Advani', role: 'Lead', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/5cVmFxFr5TP2jS7JdkbDdNYvH5A.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/4VfT3P87dRE',
    status: 'COMING_SOON',
    theatersAssigned: [],
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
    description: 'The continuation of the Kalki saga. The 10th avatar of Vishnu rises to full power as the battle against Supreme Yaskin reaches its apocalyptic climax. The fate of humanity hangs by a thread.',
    cast: [
      { name: 'Prabhas', role: 'Kalki', avatar: '' },
      { name: 'Deepika Padukone', role: 'Sumathi', avatar: '' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/jhfWGLamN6BVSG4xeMRaIiJpXMw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tIL0yFXd3Rq8c3nOhwBbFxPOEVs.jpg',
    trailerUrl: 'https://www.youtube.com/embed/oBhAfbPAMsE',
    status: 'COMING_SOON',
    theatersAssigned: [],
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
    description: 'Jake Sully and Neytiri face their greatest challenge yet as a new volcanic clan threatens the peace of Pandora. The Sully family must unite with unexpected allies to save their world.',
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully', avatar: '' },
      { name: 'Zoe Saldana', role: 'Neytiri', avatar: '' },
      { name: 'Sigourney Weaver', role: 'Kiri', avatar: '' },
    ],
    posterUrl: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/AmR3JfkerDef8o5UY7ZQs7MBER8.jpg',
    trailerUrl: 'https://www.youtube.com/embed/a8Gx8wiNbs8',
    status: 'COMING_SOON',
    theatersAssigned: [],
  },
];

// ─── SHOWTIME TIMES PER FORMAT ──────────────────────────────────────────────
const SHOW_TIMES_COMMON = ['10:00 AM','01:15 PM','04:30 PM','07:45 PM','10:45 PM'];

// ─── GENERATE SHOWTIMES ──────────────────────────────────────────────────────
function generateShowtimes(movies, theaters, dates) {
  const showtimes = [];
  let stIdNum = 1;

  for (const movie of movies) {
    if (movie.status !== 'NOW_SHOWING') continue;

    const assignedTheaters = theaters.filter(t => movie.theatersAssigned.includes(t.name));

    for (const theater of assignedTheaters) {
      // Pick 2-3 formats for this movie at this theater
      const availableFormats = theater.formats;
      // Select up to 3 formats per theater per movie
      const maxFormats = Math.min(3, availableFormats.length);
      const selectedFormats = availableFormats.slice(0, maxFormats);

      for (const format of selectedFormats) {
        const screenName = theater.screens[format] || 'Screen 1';
        const times = theater.times.slice(0, 4); // up to 4 show times per format

        for (const date of dates) {
          // Not all shows on all dates (skip 30% randomly)
          if (Math.random() < 0.15) continue;

          for (const time of times) {
            // Skip some time slots (20% skip)
            if (Math.random() < 0.20) continue;

            const stId = stIdNum.toString(16).padStart(24, '0');
            stIdNum++;

            const seats = generateSeats(format);
            const bookedCount = seats.filter(s => s.isBooked).length;
            const availableCount = seats.length - bookedCount;

            const prices = FORMAT_PRICES[format] || FORMAT_PRICES['2D'];

            showtimes.push({
              _id: stId,
              movieId: movie._id,
              cinemaName: theater.name,
              theaterName: theater.name,
              location: theater.location,
              city: theater.city,
              screen: screenName,
              format,
              date,
              time,
              language: movie.language,
              seats,
              availableSeatsCount: availableCount,
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

  return showtimes;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const movies = MOVIES_RAW;
const showtimes = generateShowtimes(movies, THEATERS, SHOW_DATES);

const catalog = { movies, showtimes };

const json = JSON.stringify(catalog, null, 2);

// Write to both locations
writeFileSync('api/catalogData.json', json, 'utf8');
writeFileSync('client/api/catalogData.json', json, 'utf8');

console.log(`✅ Catalog generated!`);
console.log(`   Movies: ${movies.length}`);
console.log(`   Showtimes: ${showtimes.length}`);
console.log(`   Theaters: ${THEATERS.length}`);
console.log(`   Formats: ${Object.keys(FORMAT_PRICES).join(', ')}`);
console.log(`   Dates: ${SHOW_DATES.join(', ')}`);
