const express = require("express");
const {
  registerUser, verifyEmail, login, forgetPassword, resetPassword, updatePassword, getSingleUser, updateUserRole, updateUser, deleteUser, logout, getRefreshToken, getAccessToken, addToLibrary, me,  
registerWithGoogleAccount ,  submitIdentity
} = require("../controller/userController");

const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth")

const router = express.Router();
router.route("/google-auth").post(registerWithGoogleAccount)
router.route("/register").post(registerUser);
router.route("/email-verify/:token").get(verifyEmail);
router.route("/login").post(login);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser,me)
router.route("/update-password").post(isAuthenticatedUser,updatePassword)
router.route("/update-user").post(isAuthenticatedUser , updateUser);
router.route("/logout").get(isAuthenticatedUser,logout)
router.route("/get-access-token").get(getAccessToken);
router.route("/submit-identity").post(isAuthenticatedUser,submitIdentity)
// user activity with book
router.route("/add-to-library").patch(isAuthenticatedUser,addToLibrary);


router.route("/admin/user/:id")
.get(isAuthenticatedUser , authorizeRoles("admin"),getSingleUser)
.put(isAuthenticatedUser , authorizeRoles("admin") , updateUserRole)
.delete(isAuthenticatedUser , authorizeRoles("admin") , deleteUser)



module.exports = router;