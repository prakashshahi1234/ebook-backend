const express = require("express");
const { initiatePurchase , completePurchase, getPurchasedBook } = require("../controller/purchaseController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { esewaPyment, initiateKhalti, completeKhalti } = require("../controller/paymentController");

const router = express.Router();

router.route('/purchase/:paymentMethod')
.get(isAuthenticatedUser , initiatePurchase , initiateKhalti)

router.route("/complete-purchase/esewa").get(esewaPyment , completePurchase)
router.route("/complete-purchase/khalti").get(completeKhalti , completePurchase)

router.route("/get-purchased").get(isAuthenticatedUser , getPurchasedBook)

 
module.exports = router;