const mongoose = require("mongoose");
const catchAsyncErrors = require("../middleware/catchAsyncErrors"); // Import your catchAsyncErrors middleware
const User = require("../model/user"); // Import your User model
const Cart = require("../model/cart"); // Import your Cart model
const Book = require("../model/book");

exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { bookId } = req.params;

  // Find the user's cart
  const cart = await Cart.findOne({ userId: id });

  if (cart) {
    // Check if the bookId is already in the cart
    if (cart.booksId.includes(bookId)) {
      return res.status(400).json({ success: false, message: 'Book is already in the cart' });
    }

    // Add the bookId to the array
    cart.booksId.push(bookId);
    await cart.save();
    return res.status(200).json({ success: true, message: 'Book added to the cart' });

  } else {
    // Create a new cart item
    const cartItem = new Cart({ userId: id, booksId: [bookId] });

    // Save the cart item to the database
    await cartItem.save();

    res.status(200).json({ success: true, message: 'Book added to the cart' });
  }
});





exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.user;

    // Find the user's cart
    const cart = await Cart.findOne({ userId: id }).select("booksId");

    // Check if the cart is not found
    if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Fetch detailed book information from the Book model
    const books = await Book.find({ _id: { $in: cart.booksId } })
        .select("title author price description"); // Add more fields as needed

    // Return the result
    res.json({ books, success: true });
});


  

// Delete Cart
exports.updateCart = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { bookId } = req.params;

  await Cart.updateOne({ userId: id }, { $pull: { booksId: bookId }} )

  return res.status(200).json({ success: true, message: "Book deleted from cart" })

});


exports.deleteCart = catchAsyncErrors(async (req, res, next) => {

  const {id} = req.user;

  await Cart.deleteOne({userId : id});

  return res.status(200).json({success : true , message : "Cart deleted successfully"})
})