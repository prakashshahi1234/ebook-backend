const express = require("express");
const { initiatePurchase , completePurchase, getPurchasedBook, readFreeBook } = require("../controller/purchaseController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { esewaPyment, initiateKhalti, completeKhalti, getPaymentDetail, getAllSell } = require("../controller/paymentController");

const router = express.Router();

router.route('/purchase/:paymentMethod')
.get(isAuthenticatedUser , initiatePurchase , initiateKhalti)

router.route("/complete-purchase/esewa").get(esewaPyment , completePurchase)
router.route("/complete-purchase/khalti").get(completeKhalti , completePurchase)

router.route("/get-purchased").get(isAuthenticatedUser , getPurchasedBook)
router.route("/read-free-book/:bookId").get(isAuthenticatedUser , readFreeBook)
 

// admin

router.route("/get-all-payment-detail").get(isAuthenticatedUser , authorizeRoles('admin') , getPaymentDetail)
router.route("/get-all-sell").get(isAuthenticatedUser , authorizeRoles('admin') , getAllSell)

module.exports = router;