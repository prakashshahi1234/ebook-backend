const ErrorHandler = require("../utils/errorhandler");
const Coupon = require("../model/coupon");
const Book = require("../model/book");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.createCupon = catchAsyncErrors(async (req, res, next) => {
  const {
    couponCode,
    discountType,
    discountValue,
    validFrom,
    validUntil,
    maxUsage,
    usageCount,
    isActive,
  } = req.body;

  const { id: userId } = req.user;

  const { bookId } = req.params;

  const isAuthor = await Book.findOne({ _id: bookId, author: userId });

  if (!isAuthor) {
    return next(new ErrorHandler("You are not author of this book", 401));
  }

  const cupon = await Coupon.create({
    bookId,
    couponCode,
    discountType,
    discountValue,
    validFrom,
    validUntil,
    maxUsage,
    usageCount,
    isActive,
  });

  return res.status(201).json({
    cupon,
    success: true,
  });
});

exports.updateCupon = catchAsyncErrors(async (req, res, next) => {
  const {
    couponCode,
    discountType,
    discountValue,
    validFrom,
    validUntil,
    maxUsage,

    usageCount,
    isActive,
  } = req.body;

  const { id: userId } = req.user;
  const { bookId, couponId } = req.params;

  const isAuthor = await Book.findOne({ _id: bookId, author: userId });

  if (!isAuthor) {
    return next(new ErrorHandler("You are not the author of this book", 401));
  }

  const existingCoupon = await Coupon.findById(couponId);

  if (!existingCoupon) {
    return next(
      new ErrorHandler("Coupon not found for the specified book", 404)
    );
  }

  // Update the existing coupon with the new values
  existingCoupon.couponCode = couponCode;
  existingCoupon.discountType = discountType;
  existingCoupon.discountValue = discountValue;
  existingCoupon.validFrom = validFrom;
  existingCoupon.validUntil = validUntil;
  existingCoupon.maxUsage = maxUsage;
  existingCoupon.usageCount = usageCount;
  existingCoupon.isActive = isActive;

  await existingCoupon.save();

  res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    data: existingCoupon,
  });
});

// for user while checkout
exports.getCoupon = catchAsyncErrors(async (req, res, next) => {
  const { bookId, couponCode } = req.params;

  const coupon = await Coupon.findOne({ couponCode, bookId });

  if (!coupon) {
    return next(
      new ErrorHandler("Coupon not found for the specified book", 404)
    );
  }

  return res.status(200).json({
    success: true,
    coupon,
  });
});


exports.getCouponByBookId  = catchAsyncErrors(async (req, res, next) => {

  const { id: userId } = req.user;

  const { bookId } = req.params;

  const isAuthor = await Book.findOne({ _id: bookId, author: userId });

  if (!isAuthor) {
    return next(new ErrorHandler("You are not author of this book", 401));  
  
  }

  const coupon = await Coupon.find({ bookId });    

  return res.status(200).json({
    success: true,
    coupon,
  })

});
