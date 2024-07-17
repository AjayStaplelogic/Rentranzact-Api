// models/User.js
import mongoose from "mongoose";
// Define the schema for the User model
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
    //   address: {
    //     type: {
    //         longitude: {
    //             type: Number,
    //             required: true
    //         },
    //         latitude: {
    //             type: Number,
    //             required: true
    //         },
    //         addressText: {
    //             type: String,
    //             required: true
    //         }
    //     },
    //     required: true
    // },
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
      required: true,
    },

    email: {
      type: String,
      required: true,
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
      required: true,
    },

    number_of_floors: {
      type: Number,
      required: true,
    },

    number_of_bathrooms: {
      type: Number,
      required: true,
    },

    carpetArea: {
      type: Number,
      required: true,
    },

    age_of_construction: {
      type: Number,
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
      required: true,
    },

    bedrooms: {
      type: Number,
      required: true,
    },

    superArea: {
      type: String,
      required: true,
    },
    availability: {
      type: Number,
      required: true,
    },
    communityType: {
      type: String,
      required: true,
    },

    cautionDeposite: {
      type: Number,
      required: true,
    },

    servicesCharges: {
      type: Number,
      required: true,
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
      required: true,
    },

    landlord_id: {
      type: String,
      required: true,
    },
    rentFrequency: {
      type: String,
      required: true,
    },
    inDemand : {
      type : Boolean,
      default : false
    },
    postedByAdmin: {
      type: Boolean,
      default : false
    }
  },
  { timestamps: true }
);

propertySchema.index({ "address.coordinates": "2dsphere" });
// Create the User model from the schema
const Property = mongoose.model("properties", propertySchema);

export { Property };
