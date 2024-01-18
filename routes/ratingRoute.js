const express = require("express");
const { createRating, updateRating, deleteRating, getRating } = require("../controller/ratingController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");

const router = express.Router();

router.route('/rating')
.post(isAuthenticatedUser , createRating)
.patch(isAuthenticatedUser ,updateRating )
.delete(isAuthenticatedUser , deleteRating)
 .get(getRating)

 

module.exports = router;