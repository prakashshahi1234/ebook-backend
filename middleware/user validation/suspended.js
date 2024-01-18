const User = require('../../model/user');
const ErrorHander = require('../../utils/errorhandler');

// Middleware to check if the user is suspended
exports.checkSuspendedUser = async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    if (user && user.isSuspended && user.isSuspended.suspended) {
      return next(new ErrorHander('User is suspended. Cannot perform this operation.', 403));
    }
  
    next();
  };

  