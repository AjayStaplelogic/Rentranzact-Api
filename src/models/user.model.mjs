// models/User.js

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
  },
  { timestamps: true }
);

// Create the User model from the schema
const User = mongoose.model("users", userSchema);

export { User };
