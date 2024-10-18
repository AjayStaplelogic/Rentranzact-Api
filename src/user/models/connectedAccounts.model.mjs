import mongoose from "mongoose";
import { EINDIVIDUAL_VERIFICATION_STATUS } from "../enums/accounts.enum.mjs"

const Schema = mongoose.Schema;

const ConnectedAccountSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    connect_acc_id: {                       // Stripe connected account id
        type: String
    },
    business_name: {
        type: String
    },
    business_type: {
        type: String
    },
    country: {
        type: String
    },
    default_currency: {
        type: String
    },
    email: {
        type: String
    },
    status: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    charges_enabled: {
        type: Boolean,
        default: false
    },
    payouts_enabled: {
        type: Boolean,
        default: false
    },

    // Individual details
    i_first_name: {
        type: String
    },
    i_last_name: {
        type: String
    },
    i_maiden_name: {
        type: String
    },
    i_email: {
        type: String
    },
    i_phone: {
        type: String
    },
    i_dob: {
        day: {
            type: Number
        },
        month: {
            type: Number
        },
        year: {
            type: Number
        },
    },
    i_address: {
        city: {
            type: String
        },
        country: {
            type: String
        },
        line1: {
            type: String
        },
        line2: {
            type: String
        },
        postal_code: {
            type: String
        },
        state: {
            type: String
        },
    },
    i_verification_status: {
        type: String,       // "verified", pending from stripe
        enum: Object.values(EINDIVIDUAL_VERIFICATION_STATUS),
        default: EINDIVIDUAL_VERIFICATION_STATUS.pending
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const ConnectedAccounts = mongoose.model('connectedaccounts', ConnectedAccountSchema);
export default ConnectedAccounts;
