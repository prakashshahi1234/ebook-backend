const express = require("express");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { getCart, addToCart, updateCart, clearCart  } = require("../controller/cartController");

const router = express.Router();

router.route('/cart/:bookId')
.post(isAuthenticatedUser , addToCart)
.patch(isAuthenticatedUser , updateCart)
.delete(isAuthenticatedUser , clearCart)
.get(isAuthenticatedUser , getCart)

 

module.exports = router;