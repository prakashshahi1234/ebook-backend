const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true , unique:[true , "Invalid Request"]},
  booksId: [{ type: mongoose.Schema.ObjectId, ref: "Book", required: true }],
});

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
