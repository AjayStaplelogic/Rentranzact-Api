// models/User.js

import mongoose from "mongoose";
import { RentApplicationStatus, ExpectedStaysDurationType } from "../enums/rentApplication.enums.mjs";

// Define the schema for the User model
const rentApplicationSchema = new mongoose.Schema(
  {
    nin: {
      type: String,
      required: false
    },

    voter_id: {
      type: String,
      required: false
    },

    bvn: {
      type: String,
      required: false
    },

    propertyID: {
      type: String,
      required: true,
      lowercase: true,
    },
    employmentStatus: {
      type: String,
      required: true,
    },
    employerName: {
      type: String,
      required: false,
    },

    employerAddress: {
      type: String,
      required: false,
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

    kinDOB: {
      type: String,
      required: false
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
      // required: true,
    },

    no_of_occupant: {
      type: Number,
      // required: true,
    },

    checkinDate: {
      type: String,
      required: true,
    },

    checkoutDate: {
      type: String,
      required: false,
    },
    emailID: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },
    maritialStatus: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      // required: true,
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
      // required: true,
    },
    permanentState: {
      type: String,
      // required: true,
    },
    permanentZipcode: {
      type: Number,
      required: true,
    },
    permanentContactNumber: {
      type: String,
      // required: true,
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
      // required: true
    },
    kinIdentityCheck: {
      type: Boolean,
      default: false,
      required: true
    },
    verifcationType: {
      type: String,
      required: true
    },
    propertyName: {
      type: String,
      required: true
    },
    previousLandlordAddress: {
      type: String,
      required: true
    },
    previousLandlordName: {
      type: String,
      required: true
    },
    pmID: {
      type: String,
      // required: false
    },

    /** Personal details */
    firstName: {
      type: String,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    gender: {
      type: String,
    },
    alternativeContactNumber: {
      type: String,
    },
    isPersonalDetailsVerified: {
      type: Boolean,
      default: false
    },
    /** Personal details */

    kinMiddleName: {
      type: String,
    },

    /** co-occupents details */
    expectedCoOccupents: {
      type: Number,
      default: 0
    },
    coOccupentName: {
      type: String,
    },
    coOccupentContact: {
      type: String,
    },
    relationWithCoOccupent: {
      type: String,
    },
    /** co-occupents details */

    /** Previous landload details */
    previouLandloadContact: {
      type: String,
    },
    previouReasonForLeaving: {
      type: String,
    },
    /** Previous landload details */

    businessName: {
      type: String,
    },
    businessType: {
      type: String,
    },
    totalEmployees: {
      type: Number,
      default: 0,
    },
    identitiy_doc: {
      type: String,
    },
    preferredFloor: {
      type: Number,
      default: 0,
    },
    expectedStays: {
      type: Number,
      default: 0,
    },
    expectedStaysDurationType: {
      type: String,
      enum: Object.keys(ExpectedStaysDurationType)
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
