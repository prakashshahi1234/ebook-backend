const mongoose = require("mongoose");
const crypto = require('crypto');
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum:['ESEWA','KHALTI' ,'CARD']
    // Define any specific properties or constraints for the 'paymentMethod' field
  },
  status: {
    type: String,      
    // Define any specific properties or constraints for the 'status' field
  },
  paymentInfo:Object
}, { timestamps: true });




module.exports = mongoose.model("Payment", paymentSchema);
