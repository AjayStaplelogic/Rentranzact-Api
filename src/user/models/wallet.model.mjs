import mongoose from "mongoose";
import { EPaymentType } from "../enums/wallet.enum.mjs"
// Define the schema for the User model
const walletSchema = new mongoose.Schema(
    {
        intentID: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },

        createdAt: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: false
        },

        payment_type: {
            type: String,
            enum: Object.values(EPaymentType)
        }
    },
    { timestamps: true }
);

// Create the User model from the schema
const Wallet = mongoose.model("Wallet", walletSchema);

export { Wallet };
