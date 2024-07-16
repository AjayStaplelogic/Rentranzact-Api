import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {

    intentID: {
      type: String,
      required: true
    },

    propertyID: {
      type: String,
      required: true
    },

    renterID: {
      type: String,
      required: false
    },

    landlordID: {
      type: String,
      required: false
    },

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
    },
    renter: {
      type: String,
      required: true
    },
    property: {
      type: String,
      required: true
    },
    landlord: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Create the User model from the schema
const Transaction = mongoose.model("transaction", transactionSchema);

export { Transaction };
