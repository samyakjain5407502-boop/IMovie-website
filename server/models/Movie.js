const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      default: [],
    },
    duration: {
      type: Number, // duration in minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    votesCount: {
      type: Number,
      default: 1250,
    },
    certification: {
      type: String,
      default: 'UA',
    },
    language: {
      type: String,
      default: 'English',
    },
    director: {
      type: String,
      default: 'Unknown',
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: '' },
        avatar: { type: String, default: '' },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['NOW_SHOWING', 'COMING_SOON'],
      default: 'NOW_SHOWING',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search (with language_override: 'none' to allow Indian languages like Hindi, Telugu, Tamil in the language field)
movieSchema.index(
  { title: 'text', description: 'text', genre: 'text' },
  { default_language: 'none', language_override: 'none' }
);

module.exports = mongoose.model('Movie', movieSchema);

