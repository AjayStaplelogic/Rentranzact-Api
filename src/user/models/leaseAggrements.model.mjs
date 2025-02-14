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
        },
        property_manager_id: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
    },
    { timestamps: true }
);

const LeaseAggrements = mongoose.model("LeaseAggrements", LeaseAggrementsSchema);

export { LeaseAggrements };
