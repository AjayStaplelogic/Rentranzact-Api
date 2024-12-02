import ChatRooms from "../models/chatRooms.model.mjs"
import mongoose from "mongoose";
import Messages from "../models/messages.model.mjs";
import { Notification } from "../models/notification.model.mjs";

const ObjectId = mongoose.Types.ObjectId;

export const user_online = (socket, connected_arr) => {
    return connected_arr.push({
        socket_id: socket.id,
        user_id: `${socket.user_id}`,
        is_admin: socket.is_admin
    })
}

export const user_offline = (socket, connected_arr) => {
    let index = connected_arr.findIndex(user => user.socket_id === socket.id);
    if (index >= 0) {
        return connected_arr.splice(index, 1)
    }
}

export const join_private_room = async (socket, data) => {
    if (!socket.is_admin) {
        let room = await ChatRooms.findOne({
            user_ids: { $all: [socket.user_id, data.chat_with] }
        });
        let resObj = {
            new_room: true,
        };
        let room_id;
        if (!room) {
            let create_room = await ChatRooms.create({
                user_ids: [socket.user_id, data.chat_with]
            })
            if (create_room) {
                room_id = create_room._id;
            }
        } else {
            room_id = room._id;
        }

        if (room_id) {
            let get_room = await get_room_by_id(room_id);
            resObj.room = get_room;
        }
        return resObj;
    } else if (socket.is_admin) {
        let room = await ChatRooms.findOne({
            user_ids: { $all: [socket.user_id, data.chat_with] }
        });
        let resObj = {
            new_room: true,
        };
        let room_id;
        if (!room) {
            let create_room = await ChatRooms.create({
                user_ids: [socket.user_id, data.chat_with],
                admin_id: socket.user_id
            })
            if (create_room) {
                room_id = create_room._id;
            }
        } else {
            room_id = room._id;
        }

        if (room_id) {
            let get_room = await get_room_by_id(room_id);
            resObj.room = get_room;
        }

        return resObj;
    }
}

export const get_room_by_id = async (id) => {
    let room = await ChatRooms.aggregate([
        {
            $match: {
                _id: new ObjectId(id),
            }
        },
        {
            $unwind: {
                path: "$user_ids",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $addFields: {
                user_id: { $toObjectId: "$user_ids" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_details"
            }
        },
        {
            $unwind: {
                path: "$user_details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "admins",
                localField: "admin_id",
                foreignField: "_id",
                as: "admin_details"
            }
        },
        {
            $unwind: {
                path: "$admin_details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$_id",
                // user_ids: { $push: "$user_details._id" },
                user_details: {
                    $push: {
                        _id: "$user_details._id",
                        fullName: "$user_details.fullName",
                        picture: "$user_details.picture"
                    }
                },
                last_message: { $last: "$last_message" },
                last_message_at: { $last: "$last_message_at" },
                last_sender: { $last: "$last_sender" },
                updatedAt: { $last: "$updatedAt" },
                admin_details: {
                    $addToSet: {
                        _id: "$admin_details._id",
                        fullName: "$admin_details.fullName",
                        picture: "$admin_details.picture",
                        is_admin: true
                    }
                }
            }
        },
        {
            $set: {
                user_details: {
                    $concatArrays: ["$user_details", "$admin_details"]
                }
            }
        },
        {
            $addFields: {
                user_ids: "$user_details._id"
            }
        },
        {
            $set: {
                user_details: {
                    $filter: {
                        input: "$user_details",
                        as: "user_details",
                        cond: {
                            $eq: [
                                { $type: "$$user_details._id" },
                                "objectId"
                            ]
                        }
                    }
                }
            },
        },
        {
            $unset: ["admin_details"]
        },
    ]);

    // console.log(room, '=====room')

    if (room?.length > 0) {
        return room[0];
    }
    return null;
}

export const get_reciever_id_from_room = async (room_id, sender_id) => {
    const room = await ChatRooms.findById(room_id);
    if (room) {
        let user_id = room?.user_ids.filter(user => user != sender_id);
        if (user_id?.length == 1) {
            return user_id[0];
        }
    }
    return null;
}

export const send_message = async (socket, data) => {
    if (socket.is_admin) {
        data.is_sender_admin = true;
        data.admin_id = socket.user_id;
    } else {
        data.is_sender_admin = false;
        data.sender_id = socket.user_id;
    }
    // data.reciever_id = await get_reciever_id_from_room(data.sender_id);
    let create_message = await Messages.create(data);
    if (create_message) {
        await update_room_last_message(create_message)
    }
    return create_message;
}

export const get_user_socket_ids = (connected_users, user_id) => {
    // console.log(connected_users.filter(user => user.user_id === user_id), '=======connected_users.filter(user => user.user_id === user_id).map(item => item.socket_id)')
    return connected_users.filter(user => user.user_id === user_id).map(item => item.socket_id)
}

export const get_admin_socket_ids = async (connected_users) => {
    return connected_users.filter(user => user.is_admin === true).map(item => item.socket_id)
}

export const update_room_last_message = async (message) => {

    let payload = {
        last_message: message.content,
        last_message_at: message.createdAt,
        last_sender: message.sender_id ?? message.admin_id,
    }

    let update_room = await ChatRooms.findByIdAndUpdate(message.room_id, payload,
        {
            new: true
        })

    // console.log(update_room, '=======update_room')
    return update_room;
}

export const read_message = async (socket, data) => {
    let query = {
        _id: data.message_id
    };
    if (socket.is_admin) {
        query.is_reciever_admin = true;
        query.admin_id = socket.user_id;
    } else {
        query.is_reciever_admin = false;
        query.reciever_id = socket.user_id;
    }

    let update_message = await Messages.findOneAndUpdate(query, { is_read: true }, { new: true });
    // console.log(update_message, '=======updated message====')
    return update_message;
}

export const join_multiple_rooms = async (socket) => {
    let get_rooms = await ChatRooms.find({
        user_ids: { $in: [socket.user_id] },
    });

    if (get_rooms && get_rooms.length) {
        let room_ids = get_rooms.map(room => `${room._id}`);
        if (room_ids && room_ids.length) {
            for (let room_id of room_ids) {
                socket.join(room_id);
            }
        }
    }
}

export const delete_message = async (message_id) => {
    let message = await Messages.findByIdAndDelete(message_id);
    if (message) {
        let last_message = await Messages.findOne({ room_id: message.room_id }).sort({ createdAt: -1 }).lean().exec();
        if (last_message) {
            await update_room_last_message(last_message);
        }
        return message;
    }
}

export const unread_notification_count = async (user_id) => {
    return Notification.countDocuments({
        send_to: user_id,
        read: false
    })
}
