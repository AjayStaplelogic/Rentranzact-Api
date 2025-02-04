import mongoose from "mongoose";
// Define the schema for the User model
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create the User model from the schema
const newsletter = mongoose.model("newsletter", newsletterSchema);

export { newsletter };
