import mongoose from "mongoose";
const TokenSchema = new mongoose.Schema({
    type: {
        type: String,
        Enum: ["reset-password"]
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: false,
    },
    token: {
        type: String,
    }
},
    { timestamps: true }
);

const Tokens = mongoose.model("tokens", TokenSchema);

export { Tokens };
