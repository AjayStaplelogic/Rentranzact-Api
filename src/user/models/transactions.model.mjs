import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {

    type : {
      type: String,
      required : true
    },

    intentID: {
      type: String,
      required: true
    },

    propertyID: {
      type: String,
      required: false
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
      required: false
    },
    property: {
      type: String,
      required: false
    },
    landlord: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

// Create the User model from the schema
const Transaction = mongoose.model("transaction", transactionSchema);

export { Transaction };
