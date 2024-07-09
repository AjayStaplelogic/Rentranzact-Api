// models/User.js

import mongoose from "mongoose";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";

// Define the schema for the User model
const rentApplicationSchema = new mongoose.Schema(
  {
    propertyID: {
      type: String,
      required: true,
      lowercase: true,
    },
    employmentStatus: {
      type: Boolean,
      required: true,
    },
    employerName: {
      type: String,
      required: true,
    },

    employerAddress: {
      type: String,
      required: true,
    },

    occupation: {
      type: String,
      required: true,
    },

    kinFirstName: {
      type: String,
      required: true,
    },
    kinLastName: {
      type: String,
      required: true,
    },
    kinDriverLicence: {
      type: String,
      required: false,
    },
    kinDOB: {
   type : String,
   required : false
    },

    kinContactNumber: {
      type: String,
      required: true,
    },
    kinEmail: {
      type: String,
      required: true,
    },

    relationshipKin: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    no_of_occupant: {
      type: Number,
      required: true,
    },

    checkinDate: {
      type: String,
      required: true,
    },

    emailID: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },
    martialStatus: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },

    rentNowPayLater: {
      type: Boolean,
      required: true,
    },
    renterID: {
      type: String,
      required: true,
    },

    permanentAddress: {
      type: String,
      required: true,
    },
    permanentCity: {
      type: String,
      required: true,
    },
    permanentState: {
      type: String,
      required: true,
    },
    permanentZipcode: {
      type: Number,
      required: true,
    },
    permanentContactNumber: {
      type: String,
      required: true,
    },
    applicationStatus: {
      type: String,
      default: RentApplicationStatus.PENDING,
    },
    statusUpdateBy: {
      type: String,
      required: false,
    },
    cancelReason: {
      type: String,
      required: false
    },
    landlordID: {
      type: String,
      required: true
    },
    kinIdentityCheck: {
      type: Boolean,
      default: false,
      required: true
    },
    verifcationType: {
      type : String,
      required : true
    },
    propertyName : {
      type : String,
      required : true
    }
  },
  
  { timestamps: true }
);

// Create the User model from the schema
const rentApplication = mongoose.model(
  "rentApplication",
  rentApplicationSchema
);

export { rentApplication };