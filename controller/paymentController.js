const ErrorHandler = require("../utils/errorhandler");
const Payment = require("../model/payment");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { verifySignature } = require("../utils/esewa");
const Cart = require("../model/cart");
var request = require('request');
const Purchase = require("../model/purchase");



exports.esewaPyment = catchAsyncErrors(async (req, res, next) => {
 
  const { data } = req.query;

  const decodedData = JSON.parse(
    Buffer.from(data, "base64").toString("utf-8")
  );

  if (decodedData.status !== "COMPLETE") {
    return res.status(400).json({ messgae: "errror" });
  }
  console.log(decodedData)

  const {status  ,signature , transaction_uuid , total_amount , transaction_code , product_code , success_url } = decodedData
  
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`

  
  const isCorrectSignature = verifySignature(decodedData);
    
  if (!isCorrectSignature) {
    return next(new ErrorHandler("invalid Information", 401));
  }

  const cart  =await Cart.findById(transaction_uuid)

  const payment = await Payment.create({
    userId:cart.userId,
    amount:total_amount,
    paymentMethod:"ESEWA",
    status,
    paymentInfo:decodedData,
  });

  req.payment = payment;

  next();

});


exports.initiateKhalti = catchAsyncErrors(async(req, res ,next)=>{

  const {purchase_order_id , purchase_order_name, amount} = req.khalti;

  var options = {
    'method': 'POST',
    'url': 'https://a.khalti.com/api/v2/epayment/initiate/',
    'headers': {
    'Authorization':`key ${process.env.KHALTI_SECRET}`,
    'Content-Type': 'application/json',
    },
   

    body: JSON.stringify({
    "return_url": "http://192.168.1.74:3002/api/v1/complete-purchase/khalti",
    "website_url": "http://192.168.1.74:3002",
    amount,
    purchase_order_id,
    purchase_order_name,

    })

};
try {
  request(options)
    .then((response) => {
      if (response.statusCode !== 200) {
        throw new ErrorHandler("Khalti payment is unavailable right now.", 503);
      }

      return res.status(200).json({
        success: true,
        payment_url: JSON.parse(response.body).payment_url,
      });
    })
    .catch((error) => {
      return next(new ErrorHandler("Khalti payment is unavailable right now.", 503));
    });
} catch (error) {
  return next(new ErrorHandler("Khalti payment is unavailable right now.", 500));
}


})

exports.completeKhalti = catchAsyncErrors(async(req, res, next)=>{

  const { txnId, pidx, mobile, purchase_order_id, purchase_order_name, transaction_id } = req.query;

  console.log(pidx);
  
  const option = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key ${process.env.KHALTI_SECRET}`,
    },
    body: JSON.stringify({ pidx }), // stringify the JSON data
  };
  
  console.log(option);
  
    const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", option); // remove curly braces around option
    const data = await response.json();

    if(data.status!=="Completed" && data.refunded===true){
       return next(new ErrorHandler("unauthorized request" , 401))
    }
    
    //   {
//     "pidx": "HT6o6PEZRWFJ5ygavzHWd5",
//     "total_amount": 1000,
//     "status": "Completed",
//     "transaction_id": "GFq9PFS7b2iYvL8Lir9oXe",
//     "fee": 0,
//     "refunded": false
//  }

const cart  =await Cart.findById(purchase_order_id)

const payment = await Payment.create({

  userId:cart.userId,

  amount:parseInt(data.total_amount)/100,

  paymentMethod:"KHALTI",

  status:data.status,

  paymentInfo:req.query,

});
console.log(payment)

req.payment = payment;

next()

})


// admin getting payment details
exports.getPaymentDetail = catchAsyncErrors(async(req, res, next)=>{

  const {date, status} = req.query;
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const payments = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: status,
      },
    },
    {
      $lookup: {
        from: "users", // Assuming your User model is named "User" and the collection is named "users"
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
       {
      $project: {
        userId: "$user._id",
        userName: "$user.name",
        userEmail: "$user.email",
        amount: 1,
        paymentMethod: 1,
        paymentInfo:1,
        status: 1,
        paymentInfo: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res.status(200).json({payments , success:true})
   
})

exports.getAllSell = catchAsyncErrors(async (req, res, next) => {
  const { date, range } = req.query;

  const startDate = new Date(date);
  const endDate = new Date(date);

  if (range === 'year') {
    startDate.setMonth(0, 1);
    endDate.setMonth(11, 31);
  } else if (range === 'month') {
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1, 0);
  } else if (range === 'day') {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid range parameter' });
  }

  const sell = await Purchase.aggregate([
    {
      $match: {
        createdAt: range !== 'day' ? { $gte: startDate, $lte: endDate } : { $gte: startDate, $lt: endDate },      },
    },
    {
      $lookup: {
        from: "payments",
        localField: "paymentId",
        foreignField: "_id",
        as: "payment",
      },
    },
    {
      $unwind: "$payment",
    },
    {
      $lookup: {
        from: "books",
        localField: "bookId",
        foreignField: "_id",
        as: "book",
      },
    },
    {
      $unwind: "$book",
    },
    {
      $group: {
        _id: {
          authorId: "$book.author",
          bookId: "$book._id",
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalAmount: { $sum: "$payment.amount" },
        totalCount: { $sum: 1 }, // Count total purchase documents
      },
    },
    {
      $group: {
        _id: {
          authorId: "$_id.authorId",
          month: "$_id.month",
          year: "$_id.year",
        },
        books: {
          $push: {
            bookId: "$_id.bookId",
            totalAmount: "$totalAmount",
            totalCount: "$totalCount",
          },
        },
        totalAmount: { $sum: "$totalAmount" },
        totalCount: { $sum: "$totalCount" },
      },
    },
    {
      $project: {
        _id: 0,

        authorId:"$_id.authorId",
        month: "$_id.month",
        year: "$_id.year",
        books: 1,
        totalAmount: 1,
        totalSell:"$totalCount"
      },
    },
  ]);

  return res.status(200).json({success:true, sell})
})


