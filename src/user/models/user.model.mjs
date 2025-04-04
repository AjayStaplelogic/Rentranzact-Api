// models/User.js
import { generateOTP } from "../helpers/otpGenerator.mjs";
import mongoose from "mongoose";
import { EACCOUNT_STATUS } from "../enums/user.enum.mjs"
// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    deleted: {
      type: Boolean,
      default: false
    },

    socialPlatform: {
      type: String,

      required: false,
    },
    email: {
      type: String,
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
    myCode: {
      type: String,
    },
    referralCode: {
      type: String,
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
      type: Array,
      default: []
    },
    fcmToken: {
      type: String,
      default: ""
    },

    walletPoints: {
      type: Number,
      default: 0
    },
    kinDetails: {
      type: Object
    },
    age: {
      type: Number,
      required: false
    },
    maritialStatus: {
      type: String,
      required: false
    },
    permanentAddress: {
      type: Object,
      required: false
    },
    employmentDetails: {
      type: Object,
      required: false
    },
    customer_id: {
      type: String,
    },
    account_status: {
      type: String,
      enum: Object.values(EACCOUNT_STATUS),
      default: EACCOUNT_STATUS.active
    },
    activatedAt: {
      type: Date,
      default: new Date()
    },
    suspendedAt: {
      type: Date
    },
    blacklistedAt: {
      type: Date
    },
    initial_role: {
      type: String,
      select: false,
    },

    renter_avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    renter_total_reviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    landlord_avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    landlord_total_reviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    pm_avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    pm_total_reviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    earned_rewards: {
      type: Number,
      default: 0,
    },
    terms_n_condition: {
      type: Boolean,
      default: false,
    },
    credit_score: {
      type: Number
    },
    credit_rating: {
      type: String
    },
    credit_score_fetched_at: {
      type: Date,
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
