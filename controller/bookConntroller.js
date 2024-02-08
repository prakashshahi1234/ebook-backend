const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Book = require("../model/book");
const { v4: uuidv4 } = require("uuid");
const User = require("../model/user");
const ApiFeatures = require("../utils/apiFeature");

// Create Book
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  // Extract necessary data from the request body
  const { title, description, price, keywords, category, coverImageUrl, url } =
    req.body;
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
  const { title, description, price, keywords, category, coverImageUrl } =
    req.body;

  // Find the book by ID and author ID
  const book = await Book.findOne({ bookId, author: req.user.id });

  if (!book) {
    return next(
      new ErrorHander("Book not found or unauthorized to update.", 404)
    );
  }

  // Update the book properties
  book.title = title || book.title;
  book.description = description || book.description;
  book.price = price || book.price;
  book.keywords = keywords || book.keywords;
  book.category = category || book.category;
  book.coverImageUrl = coverImageUrl || book.category;

  // Other book properties to update

  // Save the updated book
  await book.save();

  // Send the response
  res.status(200).json({
    success: true,
    book,
  });
});

//  initial book card serving
exports.getBookForUserChoices = catchAsyncErrors(async (req, res, next) => {

  const { categories=[], page = 1, pageSize = 10 } = req.body;

  // Calculate the number of documents to skip based on the page and pageSize
  const skip = (page - 1) * pageSize;
  
  // Find books matching the specified categories with pagination
  let books = await Book.aggregate([
    {
      $match: {
        category: { $in: categories },
        "isSuspended.suspended": false,
        "isDeleted.deleted": false,
        unPublished: false
      }
    },
    {
      $lookup: {
        from: "users", // Assuming the user details are stored in the "users" collection
        localField: "author",
        foreignField: "_id",
        as: "authorDetails"
      }
    },
    {
      $unwind: "$authorDetails" // Unwind to get a single author detail
    },
    {
      $project: {
        title: 1,
        coverImageUrl:1,
        url:1,
        price:1,
        createdAt:1,
        bookId:1,
        // Add other fields you want to include in the result
        author: {
          _id: "$authorDetails._id",
          name: "$authorDetails.name",
          // Include other author details you want
        }
      }
    }
  ])
    .skip(skip)
    .limit(pageSize);
  
  // If there are less than pageSize matching books, fetch additional books
  if (books.length < pageSize) {
    const additionalBooks = await Book.aggregate([
      {
        $match: {
          "isSuspended.suspended": false,
          "isDeleted.deleted": false,
          unPublished: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      {
        $unwind: "$authorDetails"
      },
      {
        $project: {
          title: 1,
          title: 1,
          coverImageUrl:1,
          url:1,
          price:1,
          createdAt:1,
          bookId:1,
          author: {
            _id: "$authorDetails._id",
            name: "$authorDetails.name"
            // Include other author details you want
          }
        }
      }
    ])
      .skip(skip + books.length)
      .limit(pageSize - books.length);
    books = [...books, ...additionalBooks];
  }
  
  return res.status(200).json({
    books
  });
  
});


// search books
exports.searchBooks = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10; // You can adjust this value based on your requirements
  const query = Book.find(); // Replace with your actual model

  const apiFeatures = new ApiFeatures(query, req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const books = await apiFeatures.query;

  return res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
});


exports.getBookById = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.aggregate([
    {
      $match: { bookId: req.params.bookId }
    },
    {
      $lookup: {
        from: "users", // Assuming the user details are stored in the "users" collection
        localField: "author",
        foreignField: "_id",
        as: "authorDetails"
      }
    },
    {
      $unwind: "$authorDetails"
    },
    {
      $project: {
        title: 1,
        title: 1,
        coverImageUrl:1,
        url:1,
        price:1,
        createdAt:1,
        bookId:1,
        description:1,
        // Add other book details you want to include
        author: {
          _id: "$authorDetails._id",
          name: "$authorDetails.name",
          // Include other author details you want
        }
      }
    }
  ]);

  if (!book || book.length === 0) {
    return next(new ErrorHander("Book not found", 404));
  }

  return res.status(200).json({ book: book[0], success: true });
});




exports.deleteBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findOneAndUpdate(
    { bookId: req.params.bookId, author: req.user.id },
    { "isDeleted.deleted": true }
  );

  return res.status(200).json({ success: true });

  console.log(book);
});

exports.unpublishBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findOneAndUpdate(
    { bookId: req.params.bookId, author: req.user.id },
    { unPublished: true }
  );

  return res.status(200).json({ success: true });

  console.log(book);
});

exports.getAllBookForAuthor = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const Books = await Book.find({ author: id });

  return res.status(200).json({ Books, success: true });
});
