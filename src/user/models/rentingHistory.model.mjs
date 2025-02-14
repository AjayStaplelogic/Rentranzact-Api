import mongoose from "mongoose";

const rentingHistorySchema = new mongoose.Schema(
    {
        propertyID: {
            type: String,
            required: true,
        },
        renterID: {
            type: String,
            required: true,
        },
        pmID: {
            type: String,
            required: false,
        },
        landlordID: {
            type: String,
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
            type: String,
            required: true,
        },
        renterActive: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

const RentingHistory = mongoose.model("rentingHistory", rentingHistorySchema);

export { RentingHistory };
