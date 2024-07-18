import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
    {
        concern: {
            type: String,
            required: true,
        },
        propertyID: {
            type: String,
            required: true,
        },
        renterID: {
            type: String,
            required: true,
        },

        landlordID: {
            type: String,
            required: true,
        },
        landlordRemark: {
            type: String,
            required: false,
        },
        renterRemark: {
            type: String,
            required: false,
        },
        status : {
            type : Boolean,
            default : true
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Maintenance = mongoose.model("maintenance", maintenanceSchema);

export { Maintenance };
