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
        remark: {
            type: String,
            required: false,
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Maintenance = mongoose.model("maintenance", maintenanceSchema);

export { Maintenance };
