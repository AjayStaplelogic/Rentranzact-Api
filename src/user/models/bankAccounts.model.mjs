import mongoose from "mongoose";
import { EBankAccountStatus } from "../enums/bankAccounts.enum.mjs";
const Schema = mongoose.Schema;


const AccountSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true,
        required: true
    },
    account_holder_name: {
        type: String
    },
    account_bank: {
        type: String
    },
    account_number: {
        type: String
    },
    bank_name: {
        type: String
    },
    currency: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(EBankAccountStatus),
        default: EBankAccountStatus.pending
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const BankAccounts = mongoose.model('bank_accounts', AccountSchema);
export default BankAccounts;
