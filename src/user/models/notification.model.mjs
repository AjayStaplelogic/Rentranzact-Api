import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
    {
        propertyID: {
            type: String,
        },
        renterID: {
            type: String,
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
        inspection_id: {
            type: mongoose.Types.ObjectId,
            ref: "inspections"
        },
        maintanence_id: {
            type: mongoose.Types.ObjectId,
            ref: "maintenances"
        },
        send_to: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
        property_manager_id: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
        is_send_to_admin: {
            type: Boolean,
            default: false
        },
        redirect_to: {         // Check the path from notification redirect path enum
            type: String,
        },
        transfer_id: {
            type: mongoose.Types.ObjectId,
            ref: 'transfers',
        },
        review_id: {
            type: mongoose.Types.ObjectId,
            ref: 'reviews',
        },

    },
    { timestamps: true }
);

const Notification = mongoose.model("notification", notificationSchema);

export { Notification };
