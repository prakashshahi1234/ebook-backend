const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Invalid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  google_id: String,
  books_for_sale: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  library: [{
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    edition_number: Number,
    purchase_date: {
      type: Date,
      default: Date.now,
    },
    payment_method: String,
    amount_paid: Number,
    remaining_payment: Number,
  }],
  purchases: [{
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    payment_method: String,
    amount_paid: Number,
    purchase_date: {
      type: Date,
      default: Date.now,
    },
    remaining_payment: Number,
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
