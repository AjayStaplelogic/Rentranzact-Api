// models/User.js

import mongoose from "mongoose";
// Define the schema for the User model
const inspectionSchema = new mongoose.Schema(
  {
    RenterDetails: {
      type: Object,
      required: true,
    },

    inspectionTime: {
      type: String,
      required: true,
    },
    inspectionDate: {
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
  },
  { timestamps: true }
);

// Create the User model from the schema
const Inspection = mongoose.model("inspection", inspectionSchema);

export { Inspection };
