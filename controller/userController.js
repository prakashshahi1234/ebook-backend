const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../model/user");
const sendEmail = require("../utils/sendEmail");
const sendToken = require("../utils/jwtToken");
const {v4:uuidv4} = require("uuid")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


// Registration of User (email , password)
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

  const { email, password, googleToken } = req.body;

  if(!password && !googleToken) {
    return next(new ErrorHander("Invalid Request.", 400));
  }

  let isUniqueId = false;
  let userId;

  while (!isUniqueId) {

    userId = uuidv4();
    // Check if the generated ID already exists in the database
    const existingUser = await User.findOne({ userId });

    if (!existingUser) {
      isUniqueId = true;
    }

  }  

  const user = await User.create({
    userId,
    email,
    password,
  });

  const token = user.getToken();

  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    email,
    subject: "Ebook Email Verification",
    message: `${process.env.BASE_URL}/email-verify/${token}`,
  };
  
  sendEmail(mailOptions);

  return res.json({user, validationRequire:true})

});


// verification of email paramas : (verify token) 
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const emailVerifyToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
    verify_token: emailVerifyToken,
    validation_link_expire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHander("Invalid Request.", 400));
  }

  user.email_verified = true;
  user.verify_token = null;
  user.validation_link_expire = null;
  await user.save();

  sendToken(user, 200, res);

});

// get access token
exports.getAccessToken = catchAsyncErrors(async( req, res, next)=>{

  const {refreshToken} = req.cookies;

  if (!refreshToken) {
    return next(new ErrorHander("Invalild Request ", 401));
  }
  
  const decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user =await User.findById(decodedData.id);

  if(!user) return next(new ErrorHander("Invalid Request || User Not Found."))

  const accessToken =  user.getAccessToken();

  const accessOption = {
    expires: new Date(
      Date.now() + process.env.JWT_ACCESS_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:true
  };

 return res.status(200)
  .cookie("accessToken", accessToken, accessOption)
  .json({message:"Added new access token." , success:true})

})


// user login (email ,password)
exports.login  = catchAsyncErrors(async(req , res, next)=>{

   const {email , password , googleToken} = req.body;
   
   if(!password && !googleToken) {
     return next(new ErrorHander("Invalid Password" , 400))
   }

   const user = await User.findOne({email}).select("+password");


  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  if(user.isSuspended.suspended){
    return next(new ErrorHander("Your account is suspended", 401));
  }

  sendToken(user, 200, res);

})


// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("accessToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure:true
  })
  .cookie("refreshToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure:true
  })
  

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});



// forget password (email )
exports.forgetPassword = catchAsyncErrors(async(req , res, next)=>{

  const {email} = req.body;

  const user = await User.findOne({email});

  if(!user){

    return next(new ErrorHander("Invalid Detail" ,400 ));

  }

  const token = user.getToken()  // generate token for any kind of verification
  
  try {
    const mailOptions = {
      email,
      subject: "Password Reset",
      message: `${process.env.BASE_URL}/reset-password/${token}`,
    };
    sendEmail(mailOptions);

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({message:`Email sent to ${email}` , success: true})

  } catch (error) {

    return next(new ErrorHander(error.message , 400))

  }
})


// reset password
exports.resetPassword = catchAsyncErrors(async(req, res , next)=>{

   const {token} = req.params;
   const {password , confirmPassword} = req.body;
   const emailVerifyToken = crypto
   .createHash("sha256")
   .update(token)
   .digest("hex");

 const user = await User.findOne({
   verify_token: emailVerifyToken,
   validation_link_expire: { $gt: Date.now() },
 });

 if (!user) {
   return next(new ErrorHander("Invalid Request.", 400));
 }

 if(password !==confirmPassword){
   return next(new ErrorHander("Password dosen't match." , 400));
 }
 user.password = req.body.password;
 user.verify_token = undefined;
 user.validation_link_expire = undefined;

 await user.save();

 sendToken(user, 200, res);
})


// update User password (password , newPassword , confirmPassword)
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  if(req.body.newPassword ===req.body.password){
    return next(new ErrorHander("Old password and new password are same.", 400));
  }
  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});



// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});


// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update user  (nee to fix later.s)
exports.updateUser = catchAsyncErrors(async(req , res , next)=>{
  // profileImage,
  // name , 
  // username,
  // description
  //socialLink

  // const {profileImage , name , username ,description, socialLink } = req.body;

  req.body.role=req.user.role ;
  req.body.email_verified=req.user.email_verified;
  req.body.userId=req.user.userId;
  req.body.email=req.user.email;


  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });


 res.status(200).json({
    success: true,
    user
  });
   


})

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }  

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});




// user activity with book


// Add to Library (need mongodb permanent id)
exports.addToLibrary = catchAsyncErrors(async (req, res, next) => {
  // Extract book ID and user ID from parameters and request body
  const { id } = req.user;
    const { _id } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the book_id is already in the library array
// Function to check if the book is already in the library
const isBookInLibrary = () => {
  return user.library.some(entry => entry.book_id.equals(_id));
};

    if (!isBookInLibrary) {
      // If not, add the new book to the library array
      user.library.push({ book_id: _id });

      // Save the updated user document
      await user.save();

      return res.status(200).json({ success: true, message: 'Library updated successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Book already in the library' });
    }
});