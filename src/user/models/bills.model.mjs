import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
    user_id: {                                      // Who inititated the bill payment
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    meter_number: {                       
        type: String,
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
    },
    refund_status : {
        type : String,
        default : "initiated"
    },
    refund_id : {
        type: mongoose.Types.ObjectId,
        ref: "refunds",
        index: true
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Bills = mongoose.model('bills', schema);
export default Bills;
