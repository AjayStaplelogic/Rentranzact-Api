import ChatRooms from "../models/chatRooms.model.mjs"
import mongoose from "mongoose";
import Messages from "../models/messages.model.mjs";
import { Notification } from "../models/notification.model.mjs";

const ObjectId = mongoose.Types.ObjectId;

/**
 * When user connected to socket then adding them in connected users array
 * 
 * @param {Object} socket Socket.IO object
 * @param {Array} connected_arr Array of connected users
 * @returns {Array} Array of connected users
 */
export const user_online = (socket, connected_arr) => {
    return connected_arr.push({
        socket_id: socket.id,
        user_id: `${socket.user_id}`,
        is_admin: socket.is_admin
    })
}

/**
 * When user disconnects from socket, Then removing the user Where socket id matches
 * 
 * @param {Object} socket Socket.IO Object
 * @param {Array} connected_arr Array of connected users 
 * @returns {Array} Array of connected users
 */
export const user_offline = (socket, connected_arr) => {
    let index = connected_arr.findIndex(user => user.socket_id === socket.id);
    if (index >= 0) {
        return connected_arr.splice(index, 1)
    }
}

/**
 * To create new room between users, and if already created returing the old one
 * 
 * @param {Object} socket Socket.IO object
 * @param {Object} data contains chat_with id
 * @returns {Object} object containing room information
 */
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

/**
 * To fetch room by Id and unread messages count for reciever
 * 
 * @param {ObjectId} id Id of the room
 * @param {ObjectId} user_id Id of the room user whose unread message count wanted
 * @returns {Object} Object containing room information and unread message count
 */
export const get_room_by_id = async (id, user_id) => {
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

        // Checking for messages count where receiver id matches
        {
            $lookup: {
                from: "messages",
                let: {
                    reciever_id: new ObjectId(user_id),
                    room_id: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$reciever_id", "$$reciever_id"] },
                                    { $eq: ["$is_read", false] },
                                    { $eq: ["$room_id", "$$room_id"] }
                                ]
                            }
                        }
                    },
                    {
                        $count: "unread_count"
                    }
                ],
                as: "unread_messages"
            }
        },
        {
            $addFields: {
                unread_messages_count: {
                    $cond: [
                        { $eq: ["$unread_messages", []] },
                        0,
                        { $arrayElemAt: ["$unread_messages.unread_count", 0] }
                    ]
                }
            }
        },
        // End Checking for messages count where receiver id matches
        {
            $unset: ["admin_details", "unread_messages"]
        },
    ]);
    console.log(room)
    if (room?.length > 0) {
        return room[0];
    }
    return null;
}

/**
 * To fetch the user other than the given sender Id from the private room
 * 
 * @param {ObjectId} room_id Id of the room
 * @param {ObjectId} sender_id Id of the sender
 * @returns {ObjectId} Id of the reciever
 */
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

/**
 * To create message in DB
 * 
 * @param {Object} socket Socket.IO object
 * @param {Object} data containing message content
 * @returns {Object} Newly created message object
 */
export const send_message = async (socket, data) => {
    if (socket.is_admin) {
        data.is_sender_admin = true;
        data.admin_id = socket.user_id;
    } else {
        data.is_sender_admin = false;
        data.sender_id = socket.user_id;
    }
    let create_message = await Messages.create(data);
    if (create_message) {
        await update_room_last_message(create_message)
    }
    return create_message;
}

/**
 * To find the objects from connected users where user_id matches
 * 
 * @param {Array} connected_users Array of connected users
 * @param {ObjectId} user_id Id of the user
 * @returns {Array} Array of connected users
 */
export const get_user_socket_ids = (connected_users, user_id) => {
    return connected_users.filter(user => user.user_id === user_id).map(item => item.socket_id)
}

/**
 * To find the objects of admin from connected users
 * 
 * @param {Array} connected_users Array of connected users
 * @returns {Array} Array of connected users
 */
export const get_admin_socket_ids = async (connected_users) => {
    return connected_users.filter(user => user.is_admin === true).map(item => item.socket_id)
}

/**
 * To update room when new message sent 
 * 
 * @param {Object} message Message object
 * @returns {Object} room containg updated data with latest message
 */
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

    return update_room;
}

export const read_message = async (socket, data) => {       // Not In USE
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

    let update_message = await Messages.findOneAndUpdate(query, { is_read: true, read_at: new Date() }, { new: true });
    return update_message;
}

/**
 * To update read status of messages and emitting the necessary events
 * 
 * @param {Object} io Socket.IO object
 * @param {Object} socket Socket Object
 * @param {Object} data containg message_id
 * @param {Array} connected_users Array of connected users
 * @returns {Void} Nothing
 */
export const read_multiple_messages = async (io, socket, data, connected_users) => {
    let query = {
        _id: data.message_id,
        is_read: false
    };
    // if (socket.is_admin) {
    //     query.is_reciever_admin = true;
    //     query.admin_id = socket.user_id;
    // } else {
    // query.is_reciever_admin = false;
    query.reciever_id = socket.user_id;
    // }
    console.log(JSON.stringify(query), '========query 111111111');

    Messages.findOne(query).then((get_message) => {
        console.log(get_message, '========get_message')

        if (get_message) {
            delete query._id;
            query.room_id = get_message.room_id;
            Messages.find(query).lean().exec().then((messages) => {
                query.createdAt = { $lte: get_message.createdAt };
                console.log(messages?.length, '========messages?.length');
                console.log(JSON.stringify(query), '========query');
                Messages.updateMany(query, { is_read: true, read_at: new Date() }, { new: true }).then(async (updated_messages) => {
                    console.log(updated_messages, '========updated_messages')
                    for await (let message of messages) {
                        message.is_read = true;
                        socket.to(`${message.room_id}`).emit("read-multiple-messages", {
                            status: true,
                            statusCode: 200,
                            data: message
                        });
                    }
                    get_unread_chats_count(io, connected_users, socket.user_id)
                    let get_room = await get_room_by_id(get_message.room_id, socket.user_id);
                    io.in(`${get_message.room_id}`).emit("private-room-updated", { // sending to sender and reciever
                        status: true,
                        statusCode: 200,
                        data: get_room
                    });
                });
            });
        }
    });
}

/**
 * To join all rooms of current user to socket
 * 
 * @param {Object} socket Socket object
 * @returns {Void} Nothing
 */
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

/**
 * To delete message from DB and update the room
 * 
 * @param {ObjectId} message_id Id of the message 
 * @returns {Object} Message object which is deleted
 */
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

/**
 * To get the number of notifications that is unread by particular user
 * 
 * @param {ObjectId} user_id Id of the user
 * @returns {Number} Number of notifications count
 */
export const unread_notification_count = async (user_id) => {
    return Notification.countDocuments({
        send_to: user_id,
        read: false
    })
}

/**
 * To emit a unread-chats-count event for the specified user
 * 
 * @param {Object} io Socket.IO instance 
 * @param {Array} connected_users  Array of connected users
 * @param {ObjectId} user_id Id of the user
 * @returns {Void} Nothing 
 */
export const get_unread_chats_count = async (io, connected_users, user_id) => {
    Messages.aggregate([
        {
            $match: {
                reciever_id: new ObjectId(user_id),
                is_read: false,
                is_deleted: false
            }
        },
        {
            $group: {
                _id: "$room_id",
                message_count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                unread_messages: { $sum: "$room_count" },
                unread_rooms: { $sum: 1 }
            }
        }
    ]).then((rooms) => {
        console.log(rooms, '============rooms')
        let socket_ids = get_user_socket_ids(connected_users, `${user_id}`);
        console.log(socket_ids, '============socket_ids')
        if (socket_ids && socket_ids.length > 0) {
            for (let socket_id of socket_ids) {
                console.log(socket_id, '============socket_id')

                io.in(socket_id).emit("unread-chats-count", {
                    status: true,
                    statusCode: 200,
                    data: {
                        unread_chat_count: rooms?.[0]?.unread_rooms
                    }
                });
            }
        }
    })

}


// get_unread_chats_count("", [], "66b9e04c2d49260684171507")