import mongoose from "mongoose";

const rentingHistorySchema = new mongoose.Schema(
    {
        renterID: {
            type: Object,
            required: true,
        },

        landlordID: {
            type: String,
            required: true,
        },
        rentingStart: {
            type: String,
            required: true,
        },
        rentingEnd: {
            type: String,
            required: false,
        },
        rentingType: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const RentingHistory = mongoose.model("rentingHistory", rentingHistorySchema);

export { RentingHistory };
