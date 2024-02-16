const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

  // come from user website
  let { accessToken , refreshToken} =  req.cookies ;

  // come from admin website
  const {accesstoken , refreshtoken} = req.headers;  
  if(!accessToken && accesstoken) accessToken = accesstoken
  if(!refreshToken && refreshtoken) refreshToken = refreshtoken

  // come from mobile user applicaiton
  if(!accessToken && !refreshToken && req.headers.authorization  ){
       accessToken =  JSON.parse(req.headers?.authorization)?.accessToken
       refreshToken =  JSON.parse(req.headers?.authorization)?.refreshToken
  }
  
  if (!accessToken) {

    if(refreshToken){

      const decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await User.findById(decodedData.id);
     
      if (!user) return next(new ErrorHander("Invalid Request || User Not Found."));
    
      const newAccessToken = user.getAccessToken();
    
      const accessOption = {
        expires: new Date(
          Date.now() + process.env.JWT_ACCESS_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
      };

      req.cookies.accessToken = newAccessToken
      res.
      cookie("accessToken", newAccessToken, accessOption)

      req.user = user
     
      return next()

    }

    return res.status(401).json({redirectUri:`${process.env.CLIENT_URL}/login`})
    
  }

  try {
    
    const decodedData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    
    req.user = await User.findById(decodedData.id);
    
    next();

  } catch (error) {
    console.log(error)
  }

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
   


