import mongoose from "mongoose";
import { ETRANSFER_TYPE, ETRANSFER_STATUS } from "../enums/transfer.enums.mjs";
const Schema = mongoose.Schema;
const schema = new Schema({
    transfer_type: {
        type: String,
        enum: Object.values(ETRANSFER_TYPE)
    },
    description: {
        type: String,
        select: false
    },
    connect_acc_id: {
        type: mongoose.Types.ObjectId,
        ref: 'connectedaccounts',
        index: true
    },
    account_id: {
        type: mongoose.Types.ObjectId,
        ref: 'accounts',
        index: true
    },
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    is_from_admin: {
        type: Boolean,
        default: false
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    property_id: {
        type: mongoose.Types.ObjectId,
        ref: 'properties',
        index: true
    },
    amount: {
        type: Number,
    },
    from_currency: {
        type: String,
    },
    to_currency: {
        type: String,
    },
    status: {           // When admin perform any action
        type: String,
        enum: Object.values(ETRANSFER_STATUS),
        default: ETRANSFER_STATUS.pending
    },
    transfer_id: {
        type: String,
        select: false
    },
    destination: {
        type: String,
        select: false
    },
    reversed: {
        type: Boolean,
        default: false
    },
    amount_reversed: {
        type: Number,
    },
    transferredAt: {
        type: Date
    },
    reversedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    approvedByEmpAt: {
        type: Date
    },
    rejectedByEmpAt: {
        type: Date
    },
    property_name: {
        type: String
    },
    property_address: {
        type: String
    },
    property_images: {
        type: Array
    },
    conversion_rate: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    initiatedAt: {
        type: Date
    },
    initiateRejectedAt: {
        type: Date
    },
    initiatedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'admins'
    },
    initiateRejectedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'admins'
    },
    approvedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'admins'
    },
    rejectedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'admins'
    },

}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Transfers = mongoose.model('transfers', schema);
export default Transfers;
