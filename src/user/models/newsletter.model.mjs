import mongoose from "mongoose";
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

const newsletter = mongoose.model("newsletter", newsletterSchema);

export { newsletter };
