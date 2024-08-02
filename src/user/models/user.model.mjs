// models/User.js
import { generateOTP } from "../helpers/otpGenerator.mjs";
import mongoose from "mongoose";
// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    socialPlatform: {
      type: String,

      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
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
      required: false,
    },
    countryCode: {
      type: String,
      required: false,
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
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      default:
        "https://st3.depositphotos.com/6672868/13801/v/1600/depositphotos_138013506-stock-illustration-user-profile-group.jpg",
      required: true,
    },

    favorite: {
      type : Array,
      default : []
    },

    walletPoints :{
      type: Number,
      default : 0
    }
  },
  { timestamps: true }
);

//middleware

userSchema.pre("save", function (next) {
  // Generate OTP only if it's not already set
  if (!this.otp) {
    this.otp = generateOTP();
  }
  next();
});

// Create the User model from the schema
const User = mongoose.model("users", userSchema);

export { User };
