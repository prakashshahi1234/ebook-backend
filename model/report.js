const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  report: {
    type:String,
    required:true,
    max:[500 , 'Maximum 500 character']
  },
  status: {
    type:String,
    default:"Pending",
    required:true,
    enum:["Pending"  , 'Resolving',"Resolved"] 
  },
  isVisibleToAuthor:{
    type:Boolean,
    default:false
  },
  resolvedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
  }
}, {
  timestamps: true,
});

reportSchema.index({ book: 1, reporter: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
