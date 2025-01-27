import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { ERenterType, EInviteStatus } from "../enums/invite.enum.mjs";

const schema = new Schema({
    invited_by: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        index : true
    },
    property_id: {
        type: Schema.Types.ObjectId,
        ref: 'properties',
    },
    renter_type: {
        type: String,
        enum: Object.values(ERenterType),
    },
    rent_expiration_date: {
        type: Date
    },
    rent_expiration_date_str: {
        type: String
    },
    email: {           // Renter email
        type: String,
        lowercase: true,
        trim: true,
        index : true
    },
    invite_status: {
        type: String,
        enum: Object.values(EInviteStatus),
        default: EInviteStatus.pending
    },
    invitation_token: {
        type: String
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


const Invites = mongoose.model('Invites', schema);
export default Invites;
