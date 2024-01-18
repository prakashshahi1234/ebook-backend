const mongoose = require("mongoose");


const purchase = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.ObjectId,
    ref:"user",
    require:true
  },
  bookId:{
    type:mongoose.Schema.ObjectId,
    ref:"book",
    require:true
  },
  paymentId:{
    type:mongoose.Schema.ObjectId,
    ref:"payment",
  },
  status:{
    status:{type:String , default:"pending" ,enum:["completed" ,"pending" ],require:true},
    message:{type:String ,require:true}
  }

},{timestamps:true})

purchase.index({ bookId: 1, userId: 1 , paymentId:1 }, { unique: true });

module.exports = mongoose.model("purchase" , purchase)