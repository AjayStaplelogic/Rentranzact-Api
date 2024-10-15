import mongoose from "mongoose";
import * as Constants from "../enums/common.mjs"

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
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const ConnectedAccounts = mongoose.model('connectedaccounts', ConnectedAccountSchema);
export default ConnectedAccounts;
