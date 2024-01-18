const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    maxLength:50
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours to 0 for comparison with only date part
        return value >= today;
      },
      message: 'validFrom must be a future date or today',
    },
  },

  validUntil: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours to 0 for comparison with only date part
        return value > today && value > this.validFrom;
      },
      message: 'validUntil must be a future date and after validFrom',
    },
  },

  maxUsage: {
    type: Number,
    required: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    require:true
  },

} , {timestamps:true});

couponSchema.index({ bookId: 1, couponCode: 1 }, { unique: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
