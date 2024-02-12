const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { getSignature, verifySignature } = require("../utils/esewa");
const Cart = require("../model/cart");
const Book = require("../model/book");
const Purchase = require("../model/purchase")

exports.initiatePurchase = catchAsyncErrors(async (req, res, next) => {
 
  const { id } = req.user;
  
  const {paymentMethod} = req.params;
   console.log(paymentMethod)
  const cart = await Cart.findOneAndDelete({ userId: id });

  const _id = () => {
    var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    return (
      timestamp +
      "xxxxxxxxxxxxxxxx"
        .replace(/[x]/g, function () {
          return ((Math.random() * 16) | 0).toString(16);
        })
        .toLowerCase()
    );
  };

  cart._id = _id();

  let refreshCart = await Cart.insertMany([cart]);

  refreshCart = refreshCart[0];

  const books = await Book.find({ _id: { $in: refreshCart.booksId } }).select("price title");

  const total_amount = books.reduce((p, c) => {

    return p + c.price;

  }, 0);

  if(paymentMethod==="ESEWA"){

  const product_code = "EPAYTEST";

  const message = `total_amount=${total_amount},transaction_uuid=${refreshCart._id.toString()},product_code=${product_code}`;

  let signature = getSignature(message);

  return res.status(200).json({

    success: true,

    signature,

    transactionUuid: refreshCart._id,

  });

}else if(paymentMethod==="KHALTI"){

    const dataForKhalti = {

      amount:total_amount*100 , // in paisa
      purchase_order_id:refreshCart._id,
      purchase_order_name:req.user.name || "Book order."
    
}

req.khalti = dataForKhalti;

next()

}else{

  return res.status(401).json({success:false, message:"invalid request"})
  
}

});

exports.completePurchase = catchAsyncErrors(async (req, res, next) => {

  const paymentDoc = req.payment;

  const cart = await Cart.findById(paymentDoc.paymentInfo.transaction_uuid || paymentDoc.paymentInfo.purchase_order_id);

  const purchases = cart.booksId.map((bookId) => ({

    userId: cart.userId,

    bookId,

    paymentId: paymentDoc._id,

    status:'completed'
    
  }));

  const purchase = await Purchase.insertMany(purchases);

  await Cart.deleteOne({ userId:cart.userId });
  console.log("purchase" , purchase)
  return res.status(200).json({ success: true, purchase });
});



exports.getPurchasedBook = catchAsyncErrors(async(req , res ,next)=>{

  const {id} = req.user;

  const purchases = (await Purchase.find({userId:id})).map(item=>item.bookId)
  
  if(!purchases || purchases.length<1){

    return res.status(200).json({books:[], success:true})


  }

  const books = await Book.find({_id:{$in:purchases}})

  return res.status(200).json({books, success:true})

})



