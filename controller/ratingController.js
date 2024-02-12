const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const Purchase = require("../model/purchase")
const Rating = require("../model/rating")


// have to be purchased and should not be duplicate
exports.isValidRating = catchAsyncErrors(async(req, res, next)=>{

  const {reviwe , rating , bookId} = req.body;

  const {id} = req.user;

  const isPurchased = await Purchase.findOne({bookId, userId:id}) 

  if(!isPurchased){

    return next(new ErrorHandler("you donot have purchased.", 401))

  }
  const isDuplicate = await Rating.findOne({bookId , userId:id})

  if(isDuplicate){

    return next(new ErrorHandler("Already reviewed." , 401))

  }

  next()
  
}) 

exports.createRating = catchAsyncErrors(async(req , res, next)=>{

    const {review , rating , bookId} = req.body;

    const {id:userId} = req.user;

    if(!rating || !bookId){

        return next(new ErrorHandler("Invalid Request" , 401));

    }

    const ratingX = await Rating.create({review , rating , bookId , userId});

    return res.status(200).json({success:true , rating:ratingX});

})


exports.getRating = catchAsyncErrors(async (req, res, next) => {
  const { bookId, page = 1, limit = 10 } = req.body;

  // Convert page and limit to integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Calculate the number of bad and good ratings
  const totalRatings = await Rating.countDocuments({ bookId });

  const badRatingsCount = Math.ceil(0.3 * totalRatings);
  const goodRatingsCount = totalRatings - badRatingsCount;

  // Fetch ratings with pagination
  const badRatings = await Rating.find({ bookId })
    .sort({ rating: 1 }) // Assuming lower ratings are considered "bad"
    .limit(badRatingsCount)
    .skip((pageNumber - 1) * limitNumber);

  const goodRatings = await Rating.find({ bookId })
    .sort({ rating: -1 }) // Assuming higher ratings are considered "good"
    .limit(goodRatingsCount)
    .skip((pageNumber - 1) * limitNumber);

  // Combine bad and good ratings
  const allRatings = [...badRatings, ...goodRatings];

  return res.status(200).json({
    success: true,
    totalRatings,
    ratings: allRatings,
  });
});


exports.updateRating = catchAsyncErrors(async(req , res, next)=>{

    const {review , rating , bookId} = req.body;
    
    const {id:userId} = req.user;

    if(!review || !rating || !bookId){
        return next(new ErrorHandler("Invalid Request" , 401));
    }

    const ratingX = await Rating.findOneAndUpdate({userId,bookId },{review , rating , bookId , userId}, {new:true});

    return res.status(200).json({success:true , rating:ratingX});


})


exports.deleteRating = catchAsyncErrors(async(req , res, next)=>{

    const { bookId} = req.body;
    const {id:userId} = req.user;

    if(!bookId){
        return next(new ErrorHandler("Invalid Request" , 401));
    }
  
     await Rating.deleteOne({ bookId , userId});

    return res.status(200).json({success:true });


})



