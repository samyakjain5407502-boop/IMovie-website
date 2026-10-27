const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

dotenv.config();

const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'demo@imovies.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Vikram Sharma (Cinema Manager)',
    email: 'admin@imovies.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  },
];

const sampleMovies = [
  // --- BOLLYWOOD (HINDI) ---
  {
    title: 'Stree 2: Sarkate Ka Aatank',
    description: 'After the events of Stree, the town of Chanderi is being haunted again, this time by a headless entity named Sarkata who kidnaps women. The trio Vicky, Bittu and Jana must team up with Stree to defeat him.',
    posterUrl: 'https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnheQh5_44',
    genre: ['Horror', 'Comedy', 'Mystery'],
    duration: 147,
    rating: 8.5,
    votesCount: 310000,
    certification: 'UA',
    language: 'Hindi',
    director: 'Amar Kaushik',
    featured: true,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Shraddha Kapoor', role: 'The Mystery Woman', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
      { name: 'Rajkummar Rao', role: 'Vicky', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Pankaj Tripathi', role: 'Rudra Bhaiya', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Jawan',
    description: 'A prison warden recruits inmates to commit outrageous acts of social justice and expose political corruption, leading him to confront a ruthless arms dealer who wronged his father decades ago.',
    posterUrl: 'https://image.tmdb.org/t/p/original/tFbfCkS7q6g96wVoAu8kyr93iPm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tFbfCkS7q6g96wVoAu8kyr93iPm.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    genre: ['Action', 'Thriller', 'Drama'],
    duration: 169,
    rating: 8.4,
    votesCount: 410000,
    certification: 'UA',
    language: 'Hindi',
    director: 'Atlee Kumar',
    featured: true,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Shah Rukh Khan', role: 'Vikram Rathore / Azad', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Nayanthara', role: 'Narmada Rai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
      { name: 'Vijay Sethupathi', role: 'Kaalie Gaikwad', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Animal',
    description: 'A son undergoes a fierce transformation when a bond with his emotionally distant industrialist father pushes him into extreme violence against an underworld enemy bent on destroying his family empire.',
    posterUrl: 'https://image.tmdb.org/t/p/original/lprsAHkwMxk2iC6VZxNmV0H7g1t.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lprsAHkwMxk2iC6VZxNmV0H7g1t.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Dydmpfo68DA',
    genre: ['Action', 'Crime', 'Drama'],
    duration: 201,
    rating: 8.2,
    votesCount: 380000,
    certification: 'A',
    language: 'Hindi',
    director: 'Sandeep Reddy Vanga',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Ranbir Kapoor', role: 'Ranvijay Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Anil Kapoor', role: 'Balbir Singh', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Rashmika Mandanna', role: 'Geetanjali', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Fighter',
    description: 'An elite Air Force squadron called the Air Dragons faces ruthless terrorists across the LOC, relying on their courage, skill, and fighter jets to protect the nation in thrilling dogfights.',
    posterUrl: 'https://image.tmdb.org/t/p/original/zqFuriKJ6pYDvf72kXNLONnuE8k.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/zqFuriKJ6pYDvf72kXNLONnuE8k.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=6amIq_mP4xM',
    genre: ['Action', 'Thriller'],
    duration: 166,
    rating: 8.1,
    votesCount: 260000,
    certification: 'UA',
    language: 'Hindi',
    director: 'Siddharth Anand',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Hrithik Roshan', role: 'Squadron Leader Shamsher Pathania', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Deepika Padukone', role: 'Squadron Leader Minal Rathore', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    ],
  },

  // --- TOLLYWOOD (TELUGU) ---
  {
    title: 'Pushpa 2: The Rule',
    description: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat escalates into an all-out syndicate war as Pushpa expands his red sandalwood empire across international borders.',
    posterUrl: 'https://image.tmdb.org/t/p/original/1Xcd5ci69pVXMPP02DU11Ffq0yY.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/1Xcd5ci69pVXMPP02DU11Ffq0yY.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgj9Vn4',
    genre: ['Action', 'Crime', 'Thriller'],
    duration: 182,
    rating: 8.9,
    votesCount: 520000,
    certification: 'UA',
    language: 'Telugu',
    director: 'Sukumar',
    featured: true,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Fahadh Faasil', role: 'Bhanwar Singh Shekhawat', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Kalki 2898 AD',
    description: 'In a post-apocalyptic future set in 2898 AD, the mythological warrior Ashwatthama awakens to protect the unborn avatar of Vishnu, crossing paths with the eccentric bounty hunter Bhairava.',
    posterUrl: 'https://image.tmdb.org/t/p/original/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    genre: ['Sci-Fi', 'Mythology', 'Action'],
    duration: 181,
    rating: 8.7,
    votesCount: 480000,
    certification: 'UA',
    language: 'Telugu',
    director: 'Nag Ashwin',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Prabhas', role: 'Bhairava', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Deepika Padukone', role: 'SUM-80', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'RRR (Rise Roar Revolt)',
    description: 'A fearless revolutionary and an officer in the British force, who are unaware of each other\'s identity, unite in an extraordinary friendship before turning into titans against the British Raj.',
    posterUrl: 'https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=GY4BgdUSpbE',
    genre: ['Action', 'Drama', 'Epic'],
    duration: 187,
    rating: 8.9,
    votesCount: 650000,
    certification: 'UA',
    language: 'Telugu',
    director: 'S.S. Rajamouli',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'N. T. Rama Rao Jr.', role: 'Komaram Bheem', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Ram Charan', role: 'Alluri Sitarama Raju', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Devara: Part 1',
    description: 'An epic coastal tale of courage, honor, and raw vengeance where a legendary sea chieftain vows to protect his coastal clans from treachery on high tides.',
    posterUrl: 'https://image.tmdb.org/t/p/original/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=3g5YlE6H98c',
    genre: ['Action', 'Drama'],
    duration: 178,
    rating: 8.3,
    votesCount: 340000,
    certification: 'UA',
    language: 'Telugu',
    director: 'Koratala Siva',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'NTR Jr.', role: 'Devara / Vara', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Janhvi Kapoor', role: 'Thangam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
      { name: 'Saif Ali Khan', role: 'Bhaira', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    ],
  },

  // --- KOLLYWOOD (TAMIL) ---
  {
    title: 'Leo: Bloody Sweet',
    description: 'Parthiban, a mild-mannered cafe owner in Kashmir, is identified as a dreaded former underworld gangster by ruthless criminals, forcing him to unleash his deadly past to defend his family.',
    posterUrl: 'https://image.tmdb.org/t/p/original/2XUHC4lp3tDsgfFLFygNZ2x2Um9.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2XUHC4lp3tDsgfFLFygNZ2x2Um9.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Po3jStA673E',
    genre: ['Action', 'Thriller', 'Crime'],
    duration: 164,
    rating: 8.3,
    votesCount: 420000,
    certification: 'UA',
    language: 'Tamil',
    director: 'Lokesh Kanagaraj',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Thalapathy Vijay', role: 'Parthiban / Leo Das', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Trisha Krishnan', role: 'Sathya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
      { name: 'Sanjay Dutt', role: 'Antony Das', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Jailer',
    description: 'A retired prison warden sets out on a relentless crusade to bring down a dangerous antique smuggler who seemingly murdered his honest police officer son.',
    posterUrl: 'https://image.tmdb.org/t/p/original/pTmMxAHqX4vsIDE6HPPxOR0Q6TN.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/pTmMxAHqX4vsIDE6HPPxOR0Q6TN.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=xenOE1Tma0A',
    genre: ['Action', 'Comedy', 'Thriller'],
    duration: 168,
    rating: 8.5,
    votesCount: 390000,
    certification: 'UA',
    language: 'Tamil',
    director: 'Nelson Dilipkumar',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Rajinikanth', role: 'Tiger Muthuvel Pandian', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Vinayakan', role: 'Varman', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Vikram',
    description: 'A special investigator assigned to a case of serial killings discovers that the mystery hides a clandestine war between covert police and a massive drug cartel lord.',
    posterUrl: 'https://image.tmdb.org/t/p/original/6MpAklfzhbIqonqt54MyGciDTjS.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/6MpAklfzhbIqonqt54MyGciDTjS.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=OKBMCL-frPU',
    genre: ['Action', 'Thriller'],
    duration: 175,
    rating: 8.7,
    votesCount: 460000,
    certification: 'UA',
    language: 'Tamil',
    director: 'Lokesh Kanagaraj',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Kamal Haasan', role: 'Agent Vikram', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Vijay Sethupathi', role: 'Santhanam', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Fahadh Faasil', role: 'Amar', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    ],
  },

  // --- MOLLYWOOD (MALAYALAM) ---
  {
    title: 'Manjummel Boys',
    description: 'Based on a gripping real incident: a close-knit group of friends from Kochi travel to Kodaikanal where one of them falls deep into the treacherous Guna Caves, triggering an extraordinary rescue.',
    posterUrl: 'https://image.tmdb.org/t/p/original/zGsHpuMN412VyzJZZnQeq4lMdjF.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/zGsHpuMN412VyzJZZnQeq4lMdjF.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=idT38p-K2Ww',
    genre: ['Survival', 'Adventure', 'Drama'],
    duration: 135,
    rating: 8.8,
    votesCount: 290000,
    certification: 'U',
    language: 'Malayalam',
    director: 'Chidambaram',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Soubin Shahir', role: 'Kuttan', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Sreenath Bhasi', role: 'Subhash', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Aavesham',
    description: 'Three college students arriving in Bengaluru for their engineering degree get ragged by seniors and seek assistance from an eccentric, all-white clad local gangster named Ranga.',
    posterUrl: 'https://image.tmdb.org/t/p/original/sJa3WaCx3IyU7zkudlMs7lb13gt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/sJa3WaCx3IyU7zkudlMs7lb13gt.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=L0yEMl8PXnw',
    genre: ['Action', 'Comedy'],
    duration: 158,
    rating: 8.6,
    votesCount: 220000,
    certification: 'UA',
    language: 'Malayalam',
    director: 'Jithu Madhavan',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Fahadh Faasil', role: 'Ranga', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Hipzster', role: 'Aju', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
    ],
  },

  // --- SANDALWOOD (KANNADA) ---
  {
    title: 'Kantara: A Legend Chapter 1',
    description: 'A clash of tradition and modern law in coastal Karnataka, where a rebel woodsman channels the ancestral divine spirit of Daiva to safeguard his tribe and sacred groves from feudal greed.',
    posterUrl: 'https://image.tmdb.org/t/p/original/jIsKmkxMzdCZ0Ux1GVSnu8m6Na6.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/jIsKmkxMzdCZ0Ux1GVSnu8m6Na6.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=8mrVmf239GU',
    genre: ['Mythology', 'Action', 'Drama'],
    duration: 148,
    rating: 8.7,
    votesCount: 350000,
    certification: 'UA',
    language: 'Kannada',
    director: 'Rishab Shetty',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Rishab Shetty', role: 'Shiva / Daiva', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Sapthami Gowda', role: 'Leela', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'K.G.F: Chapter 2',
    description: 'In the blood-soaked Kolar Gold Fields, Rocky\'s name strikes terror into his foes. While his allies look up to him, the government sees him as a danger to law and order alongside Adheera.',
    posterUrl: 'https://image.tmdb.org/t/p/original/93Zn3ews5S0KiChq9mW5TkrhWi9.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/93Zn3ews5S0KiChq9mW5TkrhWi9.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=JKa05nyUmuQ',
    genre: ['Action', 'Crime', 'Period'],
    duration: 168,
    rating: 8.8,
    votesCount: 560000,
    certification: 'UA',
    language: 'Kannada',
    director: 'Prashanth Neel',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Yash', role: 'Raja Krishnappa Bairya / Rocky', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
      { name: 'Sanjay Dutt', role: 'Adheera', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    ],
  },

  // --- HOLLYWOOD (ENGLISH) ---
  {
    title: 'Deadpool & Wolverine',
    description: 'The Time Variance Authority pulls Wade Wilson from his quiet life, thrusting him on a multiversal mission alongside a reluctant, world-weary Wolverine to save his entire timeline.',
    posterUrl: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    duration: 128,
    rating: 8.6,
    votesCount: 460000,
    certification: 'A',
    language: 'English',
    director: 'Shawn Levy',
    featured: true,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and the universe, he endeavors to prevent a terrible future.',
    posterUrl: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    duration: 166,
    rating: 8.8,
    votesCount: 510000,
    certification: 'UA',
    language: 'English',
    director: 'Denis Villeneuve',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Zendaya', role: 'Chani', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and political consequences of scientific innovation.',
    posterUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    genre: ['Biography', 'Drama', 'History'],
    duration: 180,
    rating: 8.9,
    votesCount: 680000,
    certification: 'R',
    language: 'English',
    director: 'Christopher Nolan',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    ],
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, encountering a society of Spider-People charged with protecting its very existence. When they clash, Miles redefines what it means to be a hero.',
    posterUrl: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    genre: ['Animation', 'Action', 'Adventure'],
    duration: 140,
    rating: 8.7,
    votesCount: 350000,
    certification: 'PG',
    language: 'English',
    director: 'Joaquim Dos Santos, Kemp Powers',
    featured: false,
    status: 'NOW_SHOWING',
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales (voice)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    ],
  },
];

// Helper to format date strings YYYY-MM-DD
const getDateString = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Seeding sample data with official TMDB posters...');

    // Clear existing collections
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});

    // 1. Insert users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    const demoUser = createdUsers[0];
    console.log(`[Seed] Created ${createdUsers.length} users (Demo: demo@imovies.com, Admin: admin@imovies.com)`);

    // 2. Insert movies
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Created ${createdMovies.length} movies with authentic official posters!`);

    // 3. Indian Multiplex Theaters with various formats
    const theaters = [
      { name: 'PVR INOX Gold: Phoenix Mall, Lower Parel (Mumbai)', screen: 'Screen 1 (IMAX with Laser 3D)', city: 'Mumbai' },
      { name: 'Cinepolis VIP: DLF Avenue, Saket (Delhi-NCR)', screen: 'Screen 2 (Dolby Atmos 7.1)', city: 'Delhi-NCR' },
      { name: 'Prasads Multiplex: Necklace Road (Hyderabad)', screen: 'Large Screen 6 (4DX Motion)', city: 'Hyderabad' },
      { name: 'PVR Forum South: Koramangala (Bengaluru)', screen: 'Screen 3 (RealD 3D)', city: 'Bengaluru' },
      { name: 'SPI Cinemas Sathyam: Royapettah (Chennai)', screen: 'Screen 1 (Dolby Vision Atmos)', city: 'Chennai' },
    ];

    const times = ['09:45 AM', '01:15 PM', '04:30 PM', '07:45 PM', '10:50 PM'];
    const showtimesCreated = [];

    // For each movie, generate showtimes for Today, Tomorrow, and Day After Tomorrow
    for (const movie of createdMovies) {
      for (let day = 0; day <= 2; day++) {
        const dateStr = getDateString(day);

        // Pick 2 theaters per movie
        for (let tIdx = 0; tIdx < 2; tIdx++) {
          const theater = theaters[(createdMovies.indexOf(movie) + tIdx) % theaters.length];

          // 2 showtimes per theater per day
          for (let sIdx = 0; sIdx < 2; sIdx++) {
            const time = times[(createdMovies.indexOf(movie) + day + sIdx * 2) % times.length];
            const pricing = { standard: 180, premium: 250, vip: 380 };
            const seats = Showtime.generateDefaultSeats(pricing);

            // Pre-book a few random seats for realism on the first showtime
            if (day === 0 && sIdx === 0) {
              const bookedSeatsList = ['D4', 'D5', 'E6', 'H3', 'H4'];
              seats.forEach((seat) => {
                if (bookedSeatsList.includes(seat.seatNumber)) {
                  seat.isBooked = true;
                  seat.bookedBy = demoUser._id;
                }
              });
            }

            const showtime = await Showtime.create({
              movieId: movie._id,
              theaterName: theater.name,
              screen: theater.screen,
              date: dateStr,
              time: time,
              format: theater.screen.includes('IMAX') ? 'IMAX 3D' : theater.screen.includes('4DX') ? '4DX' : '2D',
              pricing,
              seats,
              totalSeats: seats.length,
              availableSeatsCount: seats.filter((s) => !s.isBooked).length,
            });

            showtimesCreated.push(showtime);
          }
        }
      }
    }
    console.log(`[Seed] Created ${showtimesCreated.length} showtimes across premier multiplexes`);

    // 4. Create an initial sample booking for Demo User
    const firstShowtime = showtimesCreated[0];
    const firstMovie = createdMovies.find((m) => m._id.toString() === firstShowtime.movieId.toString());

    await Booking.create({
      bookingReference: 'IMO-782914-DEMO',
      userId: demoUser._id,
      showtimeId: firstShowtime._id,
      movieId: firstMovie._id,
      seats: ['D4', 'D5'],
      seatDetails: [
        { seatNumber: 'D4', tier: 'PREMIUM', price: 250 },
        { seatNumber: 'D5', tier: 'PREMIUM', price: 250 },
      ],
      subtotal: 500,
      convenienceFee: 45,
      totalAmount: 545,
      paymentMethod: 'UPI / Google Pay',
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    });
    console.log('[Seed] Created sample booking for demo user');

    console.log('[Seed] ✅ Database seeding complete with official TMDB posters!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};

// If run directly: node seed/seedData.js
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase, sampleMovies, sampleUsers };
