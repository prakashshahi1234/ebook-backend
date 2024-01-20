const express = require("express");
const { uploadBook, deleteAnyFile, serveBook, uploadBookCover, uploadProfilePic, uploadProfileCoverPic, loadBook } = require("../controller/fileuploadController");

const { isAuthenticatedUser, authorizeRoles, isVerifiedEmail } = require("../middleware/auth");
const router = express.Router();

router.route("/upload-book").get(isAuthenticatedUser, uploadBook);
router.route("/upload-pdf-cover").get(isAuthenticatedUser, uploadBookCover);
router.route("/upload-profile").get(isAuthenticatedUser, uploadProfilePic )
router.route("/upload-profile-cover").get(isAuthenticatedUser, uploadProfileCoverPic )


router.route("/load-book/:bookId").get(isAuthenticatedUser , loadBook);


module.exports = router;