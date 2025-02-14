import mongoose from "mongoose";
import { InspectionStatus } from "../enums/inspection.enums.mjs"

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
      enum: Object.values(InspectionStatus)
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
    propertyName: {
      type: String,
      required: true
    },
    images: {
      type: Array,
      required: true
    },
    landlordName: {
      type: String,
    },
    landlordEmail: {
      type: String,
    },
    addressText: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: false
    },
    fullDay: {
      type: Boolean,
      default: false
    },
    acceptedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users"
    }
  },
  { timestamps: true }
);

const Inspection = mongoose.model("inspection", inspectionSchema);

export { Inspection };
