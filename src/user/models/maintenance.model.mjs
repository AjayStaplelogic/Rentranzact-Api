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
            // required: true,
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
            type : String,
            default : "pending",
            enum : ["pending", "resolved", "remarked"]
        },
        resolvedOn : {
            type: String,
            required: false
        },
        canceledOn : {
            type: String,
            required : false
        },
        property_manager_id: {
            type: mongoose.Types.ObjectId,
            ref : "users"
          },
    },
    { timestamps: true }
);

// Create the User model from the schema
const Maintenance = mongoose.model("maintenance", maintenanceSchema);

export { Maintenance };
