import mongoose from "mongoose";
import * as Constants from "../enums/common.mjs"

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    gateway_type : {
        type : String,
        enum : Object.values(Constants.PAYMENT_GATEWAYS)
    },
    user_id : {
        type : mongoose.Types.ObjectId,
        ref : "users",
        index : true
    },
    name : {                        // Name on card
        type : String
    }, 
    last4 : {
        type : String,
    },
    exp_month : {
        type : Number
    },
    exp_year : {
        type : Number
    },
    card_id : {         // stripe card id
        type : String
    },
    customer_id : {         // stripe customer id
        type : String
    },
    isPrimary : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Cards = mongoose.model('cards', chatSchema);
export default Cards;
