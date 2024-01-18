const express = require("express");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { getCart, addToCart, deleteCart, updateCart  } = require("../controller/cartController");

const router = express.Router();

router.route('/cart/:bookId')
.post(isAuthenticatedUser , addToCart)
.patch(isAuthenticatedUser , updateCart)
.delete(isAuthenticatedUser , deleteCart)
.get(isAuthenticatedUser , getCart)

 

module.exports = router;