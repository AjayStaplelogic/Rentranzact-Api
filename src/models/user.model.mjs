// models/User.js
import { generateOTP } from "../helpers/otpGenerator.mjs";
import mongoose from "mongoose";
// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp : {
     type:String
    }, 
    role: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    referralCode: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    verified: {
      type :  Boolean,
      default : false
    }
  },
  { timestamps: true }
);


//middleware

userSchema.pre('save', function(next) {
  // Generate OTP only if it's not already set
  if (!this.otp) {
      this.otp = generateOTP();
  }
  next();
});



// Create the User model from the schema
const User = mongoose.model("users", userSchema);

export { User };
