const ErrorHandler = require("../utils/errorhandler");
const Payment = require("../model/payment");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { verifySignature } = require("../utils/esewa");


// export verifyPayment = catchAsyncErrors(async (req, res, next) => {})

exports.createPayment = catchAsyncErrors(async (req, res, next) => {
  const { id: userId } = req.user;
  const { paymentMethod, amount, status, paymentInfo, signature } = req.body;
  const { message , cartId } = req.params;
  const isCorrectSignature = verifySignature(cartId, signature);
    
  if (!isCorrectSignature) {
    return next(new ErrorHandler("invalid Information", 401));
  }

  if (!amount || !paymentMethod || !paymentInfo) {
    return next(new ErrorHandler("Invalid Request || Invalid Book", 401));
  }

  const payment = await Payment.create({
    userId,
    amount,
    paymentMethod,
    status,
    paymentInfo,
  });

  req.payment = payment;
  next();

});
