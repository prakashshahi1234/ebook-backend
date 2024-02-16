const express = require("express");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {createReport, getAllPendingReports, updatedReport} = require("../controller/reportController")
const router = express.Router();

// report route - user
router.route("/create-report/:bookId").post(isAuthenticatedUser, createReport)



// admin
router.route("/get-pending").get(isAuthenticatedUser , authorizeRoles('admin', 'customercare', 'officer'), getAllPendingReports)
router.route('/update-report/:id').post(isAuthenticatedUser, authorizeRoles('admin', 'customercare', 'officer'), updatedReport)
module.exports = router;