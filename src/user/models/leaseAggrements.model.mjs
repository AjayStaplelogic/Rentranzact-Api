import mongoose from "mongoose";

const LeaseAggrementsSchema = new mongoose.Schema(
    {
        propertyName : {
            type: String,
            required: true
        },
        propertyID: {
            type: String,
            required: true
        },
        renterID: {
            type: String,
            required: true
        },
        landlordID: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedBy : {
            type : String,
            required: true

        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const LeaseAggrements = mongoose.model("LeaseAggrements", LeaseAggrementsSchema);

export { LeaseAggrements };
