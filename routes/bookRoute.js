const express = require("express");
const { createBook, updateBook, getBookForUserChoices } = require("../controller/bookConntroller");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");

const router = express.Router();

router.route("/create-book").post(isAuthenticatedUser, isVerifiedEmail,createBook);
router.route('/update-book/:bookId').patch(isAuthenticatedUser , updateBook);
router.route('/get-books').post(getBookForUserChoices);
module.exports = router;