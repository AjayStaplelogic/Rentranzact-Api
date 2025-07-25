// 1. Add dropdown in Bathroom, Bedrooms and Floor numbers
// 2. When the landlord chooses Property type as open space, he should not get the option of Bathroom, Bedrooms and Floor numbers.
// 3. Remove rent type from property detail page as it is already given in the next page.
// 4. Remove Caution deposit from pricing page.
// 5. In image and documents page, Add the text after Tap to upload the documents(Deed of assignment, deed of sublease, power of attorney).

import mongoose from "mongoose";
import { ApprovalStatus } from "../enums/property.enums.mjs"
const propertySchema = new mongoose.Schema(
  {
    propertyID: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    address: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      addressText: {
        type: String,
        required: true,
      },
    },
    rent: {
      type: Number,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },

    name: {
      type: String,
    },

    email: {
      type: String,
    },

    renterID: {
      type: String,
      required: false,
    },

    rentType: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    city: {
      type: String,
    },

    number_of_floors: {
      type: Number,
      required: false,
    },

    number_of_bathrooms: {
      type: Number,
      required: false,
    },

    carpetArea: {
      type: Number,
      required: true,
    },

    age_of_construction: {
      type: String,
      required: true,
    },

    aboutProperty: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
    furnishingType: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    bedrooms: {
      type: Number,
      required: false,
    },
    superArea: {
      type: String,
    },
    availability: {
      type: Number,
      required: true,
    },
    communityType: {
      type: String,
    },
    cautionDeposite: {
      type: Number,
      required: false,
    },
    servicesCharges: {
      type: Number,
    },
    amenities: {
      type: Array,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    documents: {
      type: Array,
      required: true,
    },
    videos: {
      type: Array,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rent_period_start: {
      type: String,
      required: false,
    },
    rent_period_end: {
      type: String,
      required: false,
    },
    rent_period_due: {
      type: String,
      required: false,
    },
    rent_paid_due: {
      type: Boolean,
      required: false,
    },

    rent_start_on: {
      type: Date,
      required: false,
    },
    next_start_on: {
      type: Date,
      required: false,
    },
    next_payment_at : {
      type : Date,
    },
    rented: {
      type: Boolean,
      required: false,
      default: false,
    },
    number_of_rooms: {
      type: Number,
      required: true,
    },

    property_manager_id: {
      type: String,
      required: false,
      default: null
    },

    landlord_id: {
      type: String,
    },

    inDemand: {
      type: Boolean,
      default: false
    },
    postedByAdmin: {
      type: Boolean,
      default: false
    },
    avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    total_reviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    payment_count: {
      type: Number,
      default: 0
    },
    lease_end_timestamp: {
      type: String,
    },
    building_number: {
      type: String,
    },
    street_name: {
      type: String,
    },
    estate_name: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    servicing: {
      type: String,
    },
    total_space_for_rent: {
      type: Number,
      default: 0,
    },
    total_administrative_offices: {
      type: Number,
      default: 0,
    },
    is_legal_partner: {
      type: Boolean,
      default: false,
    },
    serviceChargeDuration: {
      type: String, // monthly, yearly, quaterly
    },
    approval_status: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING
    },
    approval_count : {    // Number of times property approved
      type: Number,
      default: 0
    },
    is_caution_legal_in_region : {
      type : Boolean,
      default : false
    }
  },
  { timestamps: true }
);

propertySchema.index({ "address": "2dsphere" });
const Property = mongoose.model("properties", propertySchema);

export { Property };
