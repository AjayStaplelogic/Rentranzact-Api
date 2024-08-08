import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    title : {
        type : String,
    },
    user_ids : [{
        type : String
    }],
    is_group : {
        type : Boolean,
        default : false
    },
    last_message : {
        type : String
    },
    last_message_at : {
        type : Date
    },
    last_sender : {
        type : String
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


const ChatRooms = mongoose.model('chatrooms', chatSchema);
export default ChatRooms;
