import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    room_id: {
        type: mongoose.Types.ObjectId,
        ref: 'chatrooms',
        index: true
    },
    sender_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    message_type: {
        type: String,
        enum: ["text", "video", "audio", "document"]
    },
    content: {
        type: String
    },
    media: [{
        type: String,
        content: String,
        url: String,
    }],
    reciever_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        index: true
    },
    is_sender_admin: {
        type: Boolean,
        default: false
    },
    is_reciever_admin: {
        type: Boolean,
        default: false
    },
    is_read: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    read_at: {
        type: Date
    },
    admin_id: {
        type: mongoose.Types.ObjectId,
        ref: 'admins',
        index: true
    },
}, {
    timestamps: true,
    toJSON: true,
    toObject: true,
});


const Messages = mongoose.model('messages', MessageSchema);
export default Messages;
