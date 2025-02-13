import mongoose from "mongoose";
import { EPaymentType } from "../enums/wallet.enum.mjs"
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

const Wallet = mongoose.model("Wallet", walletSchema);

export { Wallet };
