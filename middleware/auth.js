const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

  const { accessToken } = req.cookies;
   console.log(accessToken)
  if (!accessToken) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }
  
  const decodedData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
   
  req.user = await User.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };

}

exports.isVerifiedEmail = catchAsyncErrors((req , res,next)=>{
  if(!req.user.email_verified){
    return next(new ErrorHander("Verify your email for this feature." ,403))
  }
  next();
});
   


