const express = require("express");
const {
  registerUser,  
} = require("../controller/userController");

const router = express.Router();

router.route("/register").get(registerUser);



module.exports = router;