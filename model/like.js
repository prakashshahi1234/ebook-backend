

const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
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
  isLiked: {
    type: Boolean,
    required: true,
    required:true
  },
}, {
  timestamps: true,
});

likeSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
