// models/User.js

import mongoose from "mongoose";
// Define the schema for the User model
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
     timestamp: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: false,
    },
    inspectionApproved: {
      type: Boolean,
      default: false,
    },

    inspectionStatus: {
      type: String,
      default: "initiated",
    },
    cancelReason: {
      type: String,
      required: false,
    },

    approverID: {
      type: String,
      required: false,
    },

    canceledID: {
      type: String,
      required: false,
    },

    propertyID: {
      type: String,
      required: false,
    },

    landlordID: {
      type: String,
      required: false,
    },
    property_manager_id: {
      type: String,
      required: false,
    },
    propertyName : {
      type : String,
      required : true
    } ,
    images : {
      type: Array,
      required : true 
    }


  },
  { timestamps: true }
);

// Create the User model from the schema
const Transaction = mongoose.model("transaction", transactionSchema);

export { Transaction };
