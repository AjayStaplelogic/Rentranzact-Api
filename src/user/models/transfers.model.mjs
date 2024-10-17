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
    },
    from: {            // can be admin or user
        type: String,
        index: true
    },
    is_from_admin: {    // If true then from will be in admin model else from users model
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
        default : ETRANSFER_STATUS.pending
    },
    transfer_id: {
        type: String,
    },
    destination: {
        type: String
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
    property_name: {
        type: String
    },
    property_address: {
        type: String
    },
    property_images: {
        type: Array
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Transfers = mongoose.model('transfers', schema);
export default Transfers;