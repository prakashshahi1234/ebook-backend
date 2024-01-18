// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    // options for cookie 

    // use same secret expire time and cookie expire time 
    const refreshOption = {
      expires: new Date(
        Date.now() + process.env.JWT_REFRESH_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure:true,
      sameSite:"lax"

    };
    const accessOption = {
      expires: new Date(
        Date.now() + process.env.JWT_ACCESS_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure:true,
      sameSite:"lax"
    };
  
    res.status(statusCode)
    .cookie("accessToken", accessToken, accessOption)
    .cookie("refreshToken" ,refreshToken , refreshOption)
    .json({
      success: true,
      user,
    });
  };


  
  module.exports = sendToken;