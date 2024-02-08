// route 
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Purchase = require("../model/purchase")


const {fileUpload , loadFile}  = require("../utils/fileUpload");
const Book = require("../model/book");



exports.uploadBook = catchAsyncErrors(async (req, res, next) => {

  const key = `all-books/${req.user.userId}/${Date.now()}/pdf-${Date.now()}.pdf`;

  const expiresInSeconds = 3600;

  const url = await fileUpload(key , 'application/pdf' , expiresInSeconds)

  return  res.status(200).json({url , success:true});
  
});

exports.uploadBookCover = catchAsyncErrors(async (req, res, next) => {

  const {contentType} = req.query;

  if(contentType !== "image/png" && contentType !=='image/jpeg' && contentType !== 'image/jpg'){

    return next(new ErrorHandler(`File type :${contentType} is not supported` , 401))

  }

  const fileExtension = contentType.split("/")[1];
  
  const key = `all-books/${req.user.userId}/book-cover/cover-${Date.now()}.${fileExtension}`;

  const expiresInSeconds = 900;

  const url = await fileUpload(key , contentType , expiresInSeconds)

  return  res.status(200).json({url , success:true});
  
});


exports.uploadProfilePic = catchAsyncErrors(async (req, res, next) => {

  const {contentType} = req.query;

  if(contentType !== "image/png" && contentType !=='image/jpeg' && contentType !== 'image/jpg'){

    return next(new ErrorHandler(`File type :${contentType} is not supported` , 401))

  }

  const fileExtension = contentType.split("/")[1];
  
  const key = `all-books/${req.user.userId}/profile/profile.${fileExtension}`;

  const expiresInSeconds = 900;

  const url = await fileUpload(key , contentType , expiresInSeconds)

  return  res.status(200).json({url , success:true});
  
});


exports.uploadProfileCoverPic = catchAsyncErrors(async (req, res, next) => {

  const {contentType} = req.query;

  if(contentType !== "image/png" && contentType !=='image/jpeg' && contentType !== 'image/jpg'){

    return next(new ErrorHandler(`File type :${contentType} is not supported` , 401))

  }

  const fileExtension = contentType.split("/")[1];
  
  const key = `all-books/${req.user.userId}/profile/cover-${Date.now()}.${fileExtension}`;

  const expiresInSeconds = 900;

  const url = await fileUpload(key , contentType , expiresInSeconds)

  return  res.status(200).json({url , success:true});
  
});


exports.loadBook = catchAsyncErrors(async(req, res, next)=>{

  const {id} = req.user;

  // this is mongo db id,
  const {bookId} = req.params;
    
  const isBought = await Purchase.findOne({userId:id , bookId})

  const isAuthor = await Book.findOne({_id:bookId,author:id});

  if( !isAuthor && isBought?.status?.status!=="completed"){
    
    return next(new ErrorHandler("You are not allowed to load this book" , 401))
  
  }

  const book =await Book.findById(bookId).select("url")
   
  let expiresIn = 600;

  if(isAuthor) expiresIn = 3600;  


  const url = await loadFile(book.url , expiresIn );
    
  return res.status(200).json({url , success:true});

}
)












