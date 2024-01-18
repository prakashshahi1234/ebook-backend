const express = require("express");
const {createCupon, updateCupon , getCouponByBookId, getCoupon} = require("../controller/couponController");
const { isAuthenticatedUser } = require("../middleware/auth");
const { couponValidator } = require("../middleware/coupon validation/couponValidator");
const router = express.Router();

router.route("/create-coupon/:bookId")
      .post(isAuthenticatedUser, createCupon)
     
router.route("/coupon/:bookId/:couponId")
.patch(isAuthenticatedUser , updateCupon)

router.route("/get-coupon/:bookId/:couponId").get(isAuthenticatedUser,couponValidator, getCoupon)

router.route("/get-all-coupons/:bookId").get(isAuthenticatedUser, getCouponByBookId)


module.exports = router;