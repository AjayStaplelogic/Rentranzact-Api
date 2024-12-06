import mongoose from "mongoose";
import { ERefundfor } from "../enums/refunds.enum.mjs";
import * as Constants from "../enums/common.mjs"

const Schema = mongoose.Schema;

const schema = new Schema({
    gateway_type: {
        type: String,
        enum: Object.values(Constants.PAYMENT_GATEWAYS)
    },
    type: {
        type: String,
        enum: Object.values(ERefundfor),
        required: true
    },
    user_id: {                                      // Refunds to
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    refund_id: {
        type: String,
    },
    account_id: {
        type: String
    },
    tx_id: {
        type: String
    },
    flw_ref: {
        type: String
    },
    wallet_id: {
        type: String
    },
    amount_refunded: {
        type: Number
    },
    status: {
        type: String
    },
    destination: {
        type: String
    },
    comments: {
        type: String
    },
    reference: {
        type: String
    },
    batch_reference: {
        type: String
    },
    recharge_token: {
        type: String
    },
    fee: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    bill_id : {
        type: mongoose.Types.ObjectId,
        ref: "bills",
        index: true
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Refunds = mongoose.model('refunds', schema);
export default Refunds;
