const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    max:[200 , '200 letter maximum.'],
    trim: true,
  },
}, {
  timestamps: true,
});

ratingSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
