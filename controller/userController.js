const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../model/user");
const sendEmail = require("../utils/sendEmail");
const sendToken = require("../utils/jwtToken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");


// register / login with google account
exports.registerWithGoogleAccount = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  // after acquiring an oAuth2Client...
  const { email, email_verified } = await client.getTokenInfo(token);

  const user = await User.findOne({ email });

  // register and send token
  if (!user) {
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
      email_verified,
    });

    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);

    return;
  }

  if (user.isSuspended.suspended) {
    return next(new ErrorHander("Your account is suspended", 401));
  }

  if (user.isDeleted.deleted) {
    return next(new ErrorHander("Your account is deleted", 401));
  }

  //login
  sendToken(user, 200, res);
});

// Registration of User (email , password)
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, googleToken, name } = req.body;
  console.log(req.body);
  if (!password && !googleToken) {
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
  console.log("called");
  const user = await User.create({
    userId,
    email,
    password,
    name,
  });

  // email verify token
  const token = user.getToken();

  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    email,
    subject: "Ebook Email Verification",
    message: `${process.env.CLIENT_URL}/verify-email/${token}`,
  };

  sendEmail(mailOptions);

  return res.json({
    user,
    validationRequire: true,
    message: "Registered Successfully.Check your email and verify.",
  });
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

  if (user.isSuspended.suspended) {
    return next(new ErrorHander("Your account is suspended", 401));
  }

  if (user.isDeleted.deleted) {
    return next(new ErrorHander("Your account is deleted", 401));
  }

  user.email_verified = true;
  user.verify_token = null;
  user.validation_link_expire = null;
  await user.save();

  sendToken(user, 200, res);
});
// exports.me
// get access token
exports.getAccessToken = catchAsyncErrors(async (req, res, next) => {
  let { refreshToken } = req.cookies;
  if (!refreshToken) refreshToken = req.headers.refreshtoken;

  if (!refreshToken) {
    return next(new ErrorHander("Invalild Request ", 401));
  }

  const decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decodedData.id);

  if (!user) return next(new ErrorHander("Invalid Request || User Not Found."));

  const accessToken = user.getAccessToken();

  const accessOption = {
    expires: new Date(
      Date.now() + process.env.JWT_ACCESS_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessOption)
    .json({ message: "Added new access token.", success: true });
});

// user login (email ,password)
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, googleToken } = req.body;

  if (!password && !googleToken) {
    return next(new ErrorHander("Invalid Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHander(
        "This email is not associated with any account.Register your account.",
        401
      )
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  if (user.isSuspended.suspended) {
    return next(new ErrorHander("Your account is suspended", 401));
  }

  if (user.isDeleted.deleted) {
    return next(new ErrorHander("Your account is deleted", 401));
  }
  if (user.email_verified === false) {
    return next(new ErrorHander("Please verify your email", 401));
  }
  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res
    .cookie("accessToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
    })
    .cookie("refreshToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
    });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// forget password (email )
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHander("Invalid email.", 400));
  }

  const token = user.getToken(); // generate token for any kind of verification

  const mailOptions = {
    email,
    subject: "Password Reset",
    message: `${process.env.CLIENT_URL}/forget-password/${token}`,
  };

  sendEmail(mailOptions);

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ message: `Email sent to ${email}`, success: true });
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
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

  if (password !== confirmPassword) {
    return next(new ErrorHander("Password dosen't match.", 400));
  }

  if (user.isSuspended.suspended) {
    return next(new ErrorHander("Your account is suspended", 401));
  }

  if (user.isDeleted.deleted) {
    return next(new ErrorHander("Your account is deleted", 401));
  }
  confirmPassword;

  user.password = req.body.password;
  user.verify_token = undefined;
  user.validation_link_expire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

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

  if (req.body.newPassword === req.body.password) {
    return next(
      new ErrorHander("Old password and new password are same.", 400)
    );
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

// get details of user self.
exports.me = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  return res.status(200).json({ success: true, user });
});

// Get single user (admin)same-origin
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
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  // profileImage,
  // name ,
  // username,
  // description
  //socialLink

  // const {profileImage , name , username ,description, socialLink } = req.body;

  req.body.role = req.user.role;
  req.body.email_verified = req.user.email_verified;
  req.body.userId = req.user.userId;
  req.body.email = req.user.email;

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
  const { id } = req.user;
});

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
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Check if the book_id is already in the library array
  // Function to check if the book is already in the library
  const isBookInLibrary = () =>
    user.library.some((entry) => entry.book_id.equals(_id));

  if (!isBookInLibrary) {
    // If not, add the new book to the library array
    user.library.push({ book_id: _id });

    // Save the updated user document
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Library updated successfully" });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Book already in the library" });
  }
});

exports.removeFromLibrary = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.user;
    const { _id } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the book_id is in the library array
    const isBookInLibrary = user.library.some((entry) =>
      entry.book_id.equals(_id)
    );

    if (isBookInLibrary) {
      // Remove the book from the library array
      user.library = user.library.filter((entry) => !entry.book_id.equals(_id));

      // Save the updated user document
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Book removed from the library" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Book not found in the library" });
    }
  } catch (error) {
    return next(error); // Pass the error to the next middleware for handling
  }
});


// create identity
exports.submitIdentity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { name ,  country , province , district , municipality , wardNo , toleName , profession   } = req.body;
     
  const user = await User.findById(id);

  user.identityDetail ={
     name , country , province , district , municipality , wardNo , toleName , profession , isVerified:false, isSubmitted:true
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Identity created successfully",
  })

})


// submit payment details
// exports.setUpPaymentDetails = catchAsyncErrors(async (req, res, next) => {
//   const { bankName, branch, accontHolderName, accountNumber , isSubitted , isVerified} = req.body;
//   const { id } = req.user;

//   const user = await User.findById(id);
//   if (user.identityDetail.isVerified) {
//     res
//       .status(401)
//       .json({ message: "you cannot verify pyment detail before identity. first verify your ientity." });
//   }
  
//   user.paymentDetail = {
//     bankName,
//     branch,
//     accontHolderName,
//     accountNumber,
//   };
//   await user.save();

//   return res.status(200).json({ success: true, user });
// });
  
