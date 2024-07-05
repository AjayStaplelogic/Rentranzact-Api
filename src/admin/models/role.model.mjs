import mongoose from "mongoose";

const userRoles = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        permissions: {
            type: Array,
            required: true,
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Roles = mongoose.model("roles", userRoles);

export { Roles };
