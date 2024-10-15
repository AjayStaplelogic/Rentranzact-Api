import mongoose from "mongoose";
import * as Constants from "../enums/common.mjs"

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    connect_acc_id: {                       // Stripe connected account id
        type: String
    },

    external_acc_id: {             // Stripe external account id
        type: String,
    },

    account_holder_name: {
        type: String
    },

    bank_name: {
        type: String
    },

    country: {
        type: String
    },
    currency: {
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


const Accounts = mongoose.model('accounts', AccountSchema);
export default Accounts;
