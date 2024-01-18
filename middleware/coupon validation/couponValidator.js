const ErrorHander = require("../../utils/errorhandler");
const catchAsyncErrors = require("../catchAsyncErrors");
const Coupon = require("../../model/coupon");

exports.couponValidator = catchAsyncErrors(async (req, res, next) => {

 const {bookId , couponId} = req.params;

 const coupon = await Coupon.findOne({
    _id:couponId
    

});



});