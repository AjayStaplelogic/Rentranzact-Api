import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    user_id: {                                      // Who inititated the bill payment
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    phone_number: {                       
        type: String,
    },
    amount_charge_to_cust: {
        type: Number
    },
    bill_amount: {
        type: Number
    },
    network: {
        type: String
    },
    code: {
        type: String
    },
    tx_ref: {
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
    fee :  {
        type: Number
    },
    status : {
        type: String,
        default : "pending"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    transaction_id : {  // Transaction id when charging to customer
        type: String
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Bills = mongoose.model('bills', schema);
export default Bills;
