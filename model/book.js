const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    match:[/^[a-zA-Z0-9\s]+$/ ,"Invalid Book name.Can contain alphanumeric character and hyphem only."]

  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  keywords:{
    type: Array,
    require:true
  },
  genre: {
    type: String,
    required: true,
  },
  publicationDate: {
    type: Date,
    required: true,
  },
  ratings: {
     type:Array
  },
  coverImageUrl: {
    type: String,
    required: true,
  },
  unPublished :{
    type:Boolean,
    default:false
  },
  
}, 
{
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
