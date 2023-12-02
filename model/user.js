const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    trim: true,
    unique: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    match: [/^[a-z0-9_]{3,20}$/, "Invalid username"],
  },
  name: {
    type: String,
    match: [/^[A-Za-z][A-Za-z\s]*[A-Za-z]$/, "Invalid name"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Invalid email address",
    ],
  },
  role: {
    type: String,
    default: "user",
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  verify_token: {
    type: String,
    select: false,
  },
  validation_link_expire: {
    type: Date,
    select: false,
  },
  password: {
    type: String,
    select: false,
  },
  google_id: {
    type: String,
    select: false,
  },
  books_for_sale: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
  // library can have unpurchased book with lock.
  library: [
    {
      book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      
    }
  ],
  purchases: [
    {
      book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      paymentId :{ type:mongoose.Schema.Types.ObjectId, ref:"payment"},
      purchase_date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: String,
  },
  socialLink:{ type:Array },
  description:{
    type:String,
  }
});

// hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  console.log(process.env.JWT_EXPIRE);

  return jwt.sign({ id: this._id  , role:this.role}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
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

const User = mongoose.model("User", userSchema);

module.exports = User;
