import mongoose from "mongoose";
import { EPAYOUT_TYPE, EPAYOUT_STATUS } from "../enums/payout.enum.mjs";
const Schema = mongoose.Schema;
const schema = new Schema({
    type: {            // This is from stripe
        type: String,
        enum: Object.values(EPAYOUT_TYPE)
    },
    description: {
        type: String,
    },
    account_id: {
        type: mongoose.Types.ObjectId,
        ref: 'accounts',
        index: true
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    amount: {
        type: Number,
    },
    currency: {
        type: String,
        uppercase: true,
    },
    status: {
        type: String,
        enum: Object.values(EPAYOUT_STATUS)
    },
    payout_id: {
        type: String,
        select : false
    },
    destination: {
        type: String,
        select : false
    },
    arrival_date: {
        type: Date
    },
    arrival_date_timestamp: {
        type: Date
    },
    account_holder_name: {
        type: String
    },

    bank_name: {
        type: String
    },
    last_four: {
        type: String
    },
    failure_code: {
        type: String
    },
    failure_message: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Payouts = mongoose.model('payouts', schema);
export default Payouts;
