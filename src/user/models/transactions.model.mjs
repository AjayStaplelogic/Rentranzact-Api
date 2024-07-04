import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
     date: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Create the User model from the schema
const Transaction = mongoose.model("transaction", transactionSchema);

export { Transaction };
