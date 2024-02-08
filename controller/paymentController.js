const ErrorHandler = require("../utils/errorhandler");
const Payment = require("../model/payment");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { verifySignature } = require("../utils/esewa");
const Cart = require("../model/cart");
var request = require('request');



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
  request(options, function (error, response) {

    console.log(error)

   if (error) throw new Error(error);

   return res.status(200).json({success:true , payment_url:JSON.parse(response.body).payment_url})

});

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
console.log(cart)
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
