const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId:{
    type:String,
    required:true,
    unique:true,
  },
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
  url:{
   type:String,
   required:true,
   unique:true
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
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', /* add more categories */],
  },
  
  publicationDate: {
    type: Date,
    required: true,
  },
  coverImageUrl: {
    type: String,
    required: true,
    unique:true
  },
  unPublished :{
    type:Boolean,
    default:false
  },
  isDeleted:{
    deleteBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deleted:{type:Boolean , default:false},
    
  },
 isSuspended:{
    suspended:{type:Boolean, default:false},
    suspenededAt:Date,
    suspendedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }

 }
}, 
{
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
