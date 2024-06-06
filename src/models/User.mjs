// models/User.js

import mongoose from "mongoose";
// Define the schema for the User model
const userSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ["Landlord", "Project Manager", "Renter"],
  },
  fullName: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: Number,
    required: true,
  },
  referal_code: {
    type: Boolean,
    required: false
  },
  status : {
    type : Boolean,
    default : true
  }
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export { User };
