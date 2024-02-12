const express = require("express");
const { createRating, updateRating, deleteRating, getRating, isValidRating } = require("../controller/ratingController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");

const router = express.Router();

router.route('/rating')
.post(isAuthenticatedUser, isValidRating , createRating)
.patch(isAuthenticatedUser ,isValidRating,updateRating )
.delete(isAuthenticatedUser,isValidRating , deleteRating)
 .get(getRating)

 

module.exports = router;