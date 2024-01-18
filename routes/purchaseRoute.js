const express = require("express");
const { initiatePurchase , completePurchase } = require("../controller/purchaseController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { createPayment } = require("../controller/paymentController");

const router = express.Router();

router.route('/purchase/:cartId/:message')
.post(isAuthenticatedUser , initiatePurchase)
.patch(isAuthenticatedUser , createPayment , completePurchase)



 
module.exports = router;