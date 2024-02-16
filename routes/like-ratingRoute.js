const express = require("express");
const { createRating, updateRating, deleteRating, getRating, isValidRating } = require("../controller/ratingController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const { likeBook, isLikedBook } = require("../controller/likeController");
const {createReport} = require("../controller/reportController")
const router = express.Router();

router.route('/rating')
.post(isAuthenticatedUser, isValidRating , createRating)
.patch(isAuthenticatedUser ,isValidRating,updateRating )
.delete(isAuthenticatedUser,isValidRating , deleteRating)
 .get(getRating)

// books like
router.route("/like").post(isAuthenticatedUser , likeBook)
router.route("/is-liked/:bookId").get(isAuthenticatedUser ,isLikedBook)
  

// report route
router.route("/create-report/:bookId").post(isAuthenticatedUser, createReport)
module.exports = router;