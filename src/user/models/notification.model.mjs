import mongoose from "mongoose";
// Define the schema for the User model
const notificationSchema = new mongoose.Schema(
    {
        propertyID: {
            type: String,
            required: true
        },
        renterID: {
            type: String,
            required: true
        },
        notificationHeading: {
            type: String,
            required: true
        },

        notificationBody: {
            type: String,
            required: true
        },

        read: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            required: false
        },
        renterApplicationID: {
            type: String,
            required: false
        },
        landlordID: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
        inspection_id : {
            type : mongoose.Types.ObjectId,
            ref : "inspections"
        },
        maintanence_id : {
            type : mongoose.Types.ObjectId,
            ref : "maintenances"
        },
        send_to : {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
        property_manager_id: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
    },
    { timestamps: true }
);

// Create the User model from the schema
const Notification = mongoose.model("notification", notificationSchema);

export { Notification };
