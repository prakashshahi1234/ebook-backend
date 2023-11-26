const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
   res.status(200).json({
    name:"prakash shahi"
   })
});
