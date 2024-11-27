import mongoose from "mongoose";
const Schema = mongoose.Schema;
const schema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    bvn: {
        type: String,
    },
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    gender: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    address: {
        type: String,
    },
    email: {
        type: String,
    },
    hasLoans: {
        type: String,
    },
    ficoScore: {
        type: Number,
    },
    rating: {
        type: String,
    },
    reasons: {
        type: String,
    },
    last_fetched_at : {
        type: Date,
    }
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const CreditScores = mongoose.model('crditscores', schema);
export default CreditScores;
