const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Like = require("../model/like");

exports.likeBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId, isLiked } = req.body;
  const { id: userId } = req.user;

   console.log(req.body)
  if ( !bookId) {
    return next(new ErrorHandler("Invalid Request", 400));
  }

  try {
    // Use findOneAndUpdate to find and update or create a new document
    const like = await Like.findOneAndUpdate(
      { bookId, userId },
      { $set: { isLiked:isLiked } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, like });
  } catch (error) {
    // Handle any errors that may occur during the update/create operation
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});



exports.isLikedBook = catchAsyncErrors(async (req, res, next) => {

  const { bookId } = req.params;

  const { id: userId } = req.user;


  const isLiked = await Like.findOne({bookId, userId})
  if(!isLiked){

  return res.status(200).json({isLiked:false})
}
  else{
    return res.status(200).json({isLiked:true})

  }


});

