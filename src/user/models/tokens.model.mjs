// models/User.js
import mongoose from "mongoose";
// Define the schema for the User model
const TokenSchema = new mongoose.Schema({
    type: {
        type: String,
        Enum: ["reset-password"]
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: false,
    },
    token: {
        type: String,
    }
},
    { timestamps: true }
);


// Create the User model from the schema
const Tokens = mongoose.model("tokens", TokenSchema);

export { Tokens };
