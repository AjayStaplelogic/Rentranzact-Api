import mongoose from "mongoose";
import {ECommissionType} from "../enums/commission.enum.mjs"
const Schema = mongoose.Schema;

const commissionSchema = new Schema({
    type : {
        type : String,
        enum: Object.values(ECommissionType)
    },
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
    property_name: {
        type: String
    },
    property_address: {
        type: String
    },
    property_location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: [Number]
    },
    property_images: {
        type: Array
    },
    rent: {
        type: Number
    },
    commission: {
        type: Number
    },
    commission_per: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});

commissionSchema.index({
    "property_location": "2dsphere"
})
const Commissions = mongoose.model('commissions', commissionSchema);
export default Commissions;
