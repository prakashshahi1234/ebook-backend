// middleware.js

const User = require('../model/user');
const ErrorHander = require('../utils/errorhandler');

// Middleware to check if the user is deleted
exports.checkDeletedUser = async (req, res, next) => {

    const { email } = req.body; // Assuming you're checking by email from the request body
  const user = await User.findOne({ email });

  if (user && user.isDeleted && user.isDeleted.deleted) {
    return next(new ErrorHander('User is deleted. Cannot perform this operation.', 403));
  }

  next();
};


