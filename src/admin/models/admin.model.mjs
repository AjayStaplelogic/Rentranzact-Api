// models/User.js
import mongoose from "mongoose";
// Define the schema for the User model
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
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
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    countryCode: {
      type: String,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    joining_date: {
      type: Date
    },
    fcmToken: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

// Create the User model from the schema
const Admin = mongoose.model("admin", adminSchema);

export { Admin };
