import mongoose from "mongoose";
import { EReferralEarningStatus } from "../enums/referral.enum.mjs";
const Schema = mongoose.Schema;

const referralEarningsSchema = new Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    property_id: {
        type: mongoose.Types.ObjectId,
        ref: "properties",
        index: true
    },
    amount: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type : String,
        enum: Object.values(EReferralEarningStatus),
        default: EReferralEarningStatus.pending
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});

const ReferralEarnings = mongoose.model('referralearnings', referralEarningsSchema);
export default ReferralEarnings;
