const ErrorHandler = require("../utils/errorhandler");
const Purchase = require("../model/purchase");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { getSignature } = require("../utils/esewa");
const Cart = require("../model/cart");

exports.initiatePurchase = catchAsyncErrors(async (req, res, next) => {

  const { cartId , message} = req.params;

  let  signature  = getSignature(cartId)

  console.log(signature)

  return res.status(200).json({
    success: true,
    signature
  });

});

exports.completePurchase = catchAsyncErrors(async (req, res, next) => {
 
    const paymentInfo = req.payment;
    const {cartId} = req.params;
    const {id:userId} = req.user;

    const cart = await Cart.findById(cartId);
    
    const purchases = cart.booksId.map(bookId=>({
      userId,
      bookId,
      status:{status: "completed"},
      paymentId: paymentInfo._id,
    }))

    console.log(purchases)
  const purchase = await Purchase.insertMany(purchases);
       console.log(purchase)
  await Cart.deleteOne({userId})

  return res.status(200).json({ success: true, purchase });

});
