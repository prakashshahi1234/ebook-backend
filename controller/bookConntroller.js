const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Book = require("../model/book");
const { v4: uuidv4 } = require("uuid");
const User = require("../model/user");

// Create Book
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  // Extract necessary data from the request body
  const {
    title,
    description,
    price,
    keywords,
    category,
    coverImageUrl,
    url,
    publicationDate,
    
  } = req.body;
  const author = req.user._id;
  // Additional validation if needed

  let isUniqueId = false;
  let bookId;

  while (!isUniqueId) {
    // Generate a UUID
    bookId = uuidv4();

    // Check if the generated ID already exists in the database
    const existingBook = await Book.findOne({ bookId });

    if (!existingBook) {
      isUniqueId = true;
    }

  }

  // Create a new book
  const book = await Book.create({
    bookId,
    category,
    title,
    author,
    description,
    price,
    keywords,
    coverImageUrl,
    url,
    publicationDate,
  });

  // Handle any additional logic (e.g., sending notifications, updating statistics)

  // Send the response
  return res.status(201).json({
    success: true,
    book,
  });

});

// Update Book (update book if the author is same)
exports.updateBook = catchAsyncErrors(async (req, res, next) => {
  // Extract book ID from parameters
  const { bookId } = req.params;

  // Extract updated data from the request body
  const {  
    title,
    description,
    price,
    keywords,
    category,
    coverImageUrl,
    publicationDate
    ,} = req.body;

  // Find the book by ID and author ID
  const book = await Book.findOne({ bookId, author: req.user.id });

  if (!book) {
    return next(new ErrorHander('Book not found or unauthorized to update.', 404));
  }


  // Update the book properties
  book.title       = title || book.title;       
  book.description = description ||book.description;
  book.price  = price || book.price ;
  book.keywords = keywords ||  book.keywords;
  book.category = category || book.category;
  book.coverImageUrl  = coverImageUrl || book.category;
  book.publicationDate = publicationDate || book.publicationDate;

  // Other book properties to update

  // Save the updated book
  await book.save();

  // Send the response
  res.status(200).json({
    success: true,
    book,
  });

});


exports.getBookForUserChoices = catchAsyncErrors(async (req, res, next) => {
  const { categories } = req.body;

  // Find books matching the specified categories
  let books = await Book.find({
    category: { $in: categories },
    isSuspended: { suspended: false },
    isDeleted: { deleted: false },
    unPublished: false
  }).limit(10);

  // If there are less than 10 matching books, fetch additional books
  if (books.length < 10) {
    const additionalBooks = await Book.find({
      isSuspended: { suspended: false },
      isDeleted: { deleted: false },
      unPublished: false
    }).limit(20 - books.length);

    books = [...books, ...additionalBooks];
  }

  return res.status(200).json({
    books
  });
});


 
