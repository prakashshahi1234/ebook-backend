const express = require("express");
const { createBook, updateBook, getBookForUserChoices, searchBooks, getBookById, getAllBookForAuthor } = require("../controller/bookConntroller");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/create-book").post(isAuthenticatedUser,createBook);
router.route('/update-book/:bookId').patch(isAuthenticatedUser , updateBook);
router.route('/get-books').post(getBookForUserChoices);
router.route("/get-book/:bookId").get(getBookById);
router.route("/search").get(searchBooks);


router.route("/get-all-book-author").get(isAuthenticatedUser ,getAllBookForAuthor);
module.exports = router;