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

  name: {
    type: String,
    match: [/^[A-Za-z][A-Za-z\s]*[A-Za-z]$/, "Invalid name"],
  },

  email: {
    type: String,
    required: true,
    unique: [true, "This iiiiiiiiiiiiiiiiiiiiiiiie"],
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
  identityDetail:{
    type:Object,
    // select:false,

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
      type:Array
    
   
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
  
  
  socialLink: { type: Array,
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
    validation:{
      validator:function(v){
        // implement logic
        return true;
      },
      message:"Invalid Description"
    }

  },
  
  refreshToken:{type:Array },

  isDeleted:{
    deleteBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deleted:{type:Boolean , default:false},
    
  },
 isSuspended:{
    suspended:{type:Boolean, default:false},
    suspenededAt:Date,
    suspendedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }

 }
},

{
  timestamps:true
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

  return jwt.sign(
    { id: this._id},
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE*24*60*60,
    }
    
  );

};

// jwt refresh token
userSchema.methods.getRefreshToken = function () {

  return jwt.sign(
    { id: this._id},
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE*24*60*60,
    }

  );
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
