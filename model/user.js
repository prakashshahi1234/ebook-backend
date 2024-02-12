const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
      unique: true,
    },

    name: {
      type: String,
      match: [/^[A-Za-z][A-Za-z\s]*[A-Za-z]$/, "Invalid name"],
    },

    email: {
      type: String,
      required: true,
      unique: [true, "Invalid email"],
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Invalid email address",
      ],
    },
    mobileNo: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10}$/i
      ],
    },
    role: {
      type: String,
      default: "user",
      select: false,
    },

    email_verified: {
      type: Boolean,
      default: false,
    },

    verify_token: {
      type: String,
      select: false,
    },

    otp: { type: Number, select: false },

    validation_link_expire: {
      type: Date,
      select: false,
    },

    identityDetail: {
      type: Object,
    },
    paymentDetail:{
      type:Object
    },

    password: {
      type: String,
      select: false,
    },

    google_id: {
      type: String,
      select: false,
    },

    // library can have unpurchased book with lock.
    library: {
      book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      type: Array,
    },

    profileImageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          // Implement image format validation logic
          return true;
        },
        message: "Invalid image format",
      },
    },

    socialLink: {
      type: Array,
      validate: {
        validator: function (v) {
          // Implement image format validation logic
          return true;
        },
        message: "Invalid image format",
      },
    },

    description: {
      type: String,
      validation: {
        validator: function (v) {
          // implement logic
          return true;
        },
        message: "Invalid Description",
      },
    },

    refreshToken: { type: Array, select: false },

    isDeleted: {
      deleteBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        select: false,
      },
      deleted: { type: Boolean, default: false, select: false },
    },
    
    isSuspended: {
      suspended: { type: Boolean, default: false, select: false },
      suspenededAt: Date,
      suspendedBy: {
        select: false,

        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },

  {
    timestamps: true,
  }
);

// hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT access token
userSchema.methods.getAccessToken = function () {

  const token = jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRE * 24 * 60 * 60),
  });
  return token;
};

// jwt refresh token
userSchema.methods.getRefreshToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE * 24 * 60 * 60),
  });
  return token;
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Hashing and adding email_verify_token to userSchema
  this.verify_token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.validation_link_expire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

userSchema.methods.getOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);
  this.otp = otp;
  this.validation_link_expire = Date.now() + 15 * 60 * 1000;
  console.log(otp);
  return otp;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
