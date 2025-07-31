import mongoose from "mongoose";
import { ETRANSACTION_LANDLORD_PAYMENT_STATUS, ETRANSACTION_PM_PAYMENT_STATUS, ETRANSACTION_TYPE } from "../enums/common.mjs";
const transactionSchema = new mongoose.Schema(
  {

    wallet: {
      type: Boolean,
      required: false
    },

    type: {
      type: String,
      required: true
    },

    intentID: {
      type: String,
      required: true
    },

    propertyID: {
      type: String,
      required: false
    },

    renterID: {
      type: String,
      required: false
    },

    landlordID: {
      type: String,
      required: false
    },

    pmID: {
      type: String,
      required: false

    },

    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    renter: {
      type: String,
      required: false
    },
    property: {
      type: String,
      required: false
    },
    landlord: {
      type: String,
      required: false
    },
    payment_mode: {
      type: String,
    },
    allCharges: {
      type: Object,
      required: false
    },

    transaction_type: {
      type: String,
      enum: Object.values(ETRANSACTION_TYPE)
    },

    receiver_id: {
      type: mongoose.Types.ObjectId,
      ref: "users"
    },

    property_address: {
      type: String
    },

    landlord_payment_status: {
      type: String,
      enum: Object.values(ETRANSACTION_LANDLORD_PAYMENT_STATUS),
      default: ETRANSACTION_LANDLORD_PAYMENT_STATUS.pending
    },

    pm_payment_status: {
      type: String,
      enum: Object.values(ETRANSACTION_PM_PAYMENT_STATUS),
      default: ETRANSACTION_PM_PAYMENT_STATUS.pending
    },
    landlord_transfer_date: {
      type: Date
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transaction", transactionSchema);

export { Transaction };
