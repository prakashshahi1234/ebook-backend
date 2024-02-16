const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Book = require("../model/book");
const { v4: uuidv4 } = require("uuid");
const User = require("../model/user");
const ApiFeatures = require("../utils/apiFeature");
const { default: mongoose } = require("mongoose");

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
  book.price = price;
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
      $lookup: {
        from: "likes", // Assuming the likes details are stored in the "likes" collection
        localField: "_id",
        foreignField: "bookId",
        as: "likes"
      }
    },
    {
      $addFields: {
        totalLikes: { $size: "$likes" }
      }
    },
    {
      $project: {
        title: 1,
        coverImageUrl: 1,
        url: 1,
        price: 1,
        createdAt: 1,
        bookId: 1,
        author: {
          _id: "$authorDetails._id",
          name: "$authorDetails.name",
          isVerified:"$authorDetails.identityDetail.isVerified"
        },
        totalLikes: 1
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
        $lookup: {
          from: "likes", // Assuming the likes details are stored in the "likes" collection
          localField: "_id",
          foreignField: "bookId",
          as: "likes"
        }
      },
      {
        $addFields: {
          totalLikes: { $size: "$likes" }
        }
      },
      {
        $project: {
          title: 1,
          coverImageUrl: 1,
          url: 1,
          price: 1,
          createdAt: 1,
          bookId: 1,
          author: {
            _id: "$authorDetails._id",
            name: "$authorDetails.name",
            isVerified:"$authorDetails.identityDetail.isVerified"

          },
          totalLikes: 1
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


// Search books
exports.searchBooks = catchAsyncErrors(async (req, res, next) => {
  console.log(req.query)

  const resultPerPage = 10; 

  const query = Book.find(); 

  const apiFeatures = new ApiFeatures(query, req.query).search().filter().sort().pagination(resultPerPage);

  const books = await apiFeatures.query;
  return res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
});

exports.getBookById = catchAsyncErrors(async (req, res, next) => {
   const {bookId} = req.params;
 
  try {
    
  
  let book = await Book.aggregate([
    {
      $match: {
        "_id": new mongoose.Types.ObjectId(bookId),
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "bookId",
        as: "likes"
      }
    },
    {
      $addFields: {
        totalLikes: { $size: "$likes" }
      }
    },
    {
      $project: {
        title: 1,
        coverImageUrl: 1,
        url: 1,
        price: 1,
        createdAt: 1,
        bookId: 1,
        description:1,
        author: {
          _id: "$authorDetails._id",
          name: "$authorDetails.name",
          isVerified:"$authorDetails.identityDetail.isVerified"

        },
        totalLikes: 1
      }
    }
  ]);
  
  if (!book || book.length === 0) {
    return next(new ErrorHander("Book not found", 404));
  }

  return res.status(200).json({ book:book[0], success: true });
 } catch (error) {
    console.log(error)
  }
});




exports.deleteBook = catchAsyncErrors(async (req, res, next) => {

  await Book.findOneAndUpdate( { bookId: req.params.bookId, author: req.user.id },[{$set:{"isDeleted.deleted":{$eq:[false,"$isDeleted.deleted"]}}}]);

  return res.status(200).json({ success: true });


});

exports.unpublishBook = catchAsyncErrors(async (req, res, next) => {
  
  await Book.findOneAndUpdate(
    { bookId: req.params.bookId, author: req.user.id}
    ,[{$set:{unPublished:{$eq:[false,"$unPublished"]}}}]
    );


  return res.status(200).json({ success: true });
});



exports.getAllBookForAuthor = catchAsyncErrors(async (req, res, next) => {
  
  const { id } = req.user;

  const Books = await Book.find({ author: id });

  return res.status(200).json({ Books, success: true });

});
