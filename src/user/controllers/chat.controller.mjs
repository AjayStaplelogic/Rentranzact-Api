import mongoose from "mongoose";
import { sendResponse } from "../helpers/sendResponse.mjs";
import ChatRooms from "../models/chatRooms.model.mjs";
import Messages from "../models/messages.model.mjs";
import * as ChatValidations from "../validations/chat.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
const ObjectId = mongoose.Types.ObjectId;

export const joinChatRoom = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, ChatValidations.joinChatRoom);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let { user_id, chat_with, is_admin, admin_id } = req.body;

        const query = {
            user_ids: { $in: [user_id, chat_with] }
        }

        if (is_admin && admin_id) {
            query.admin_id = admin_id;
        }

        const room = await ChatRooms.findOne(query).lean().exec();
        if (room) {
            return sendResponse(res, room, "success", true, 200);
        }

        const payload = {
            user_ids: [user_id, chat_with],
            admin_id: admin_id || null
        }

        let create_room = await ChatRooms.create(payload)
        if (create_room) {
            return sendResponse(res, create_room, "success", true, 200);
        }
    } catch (error) {
        return sendResponse(res, null, error.message, false, 400)
    }
}

export const getChatRooms = async (req, res) => {
    try {
        // console.log("[Review Listing]")
        let { user_id, search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (user_id) { query.user_ids = user_id };
        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { title: { $regex: search, $options: 'i' } },
                { last_message: { $regex: search, $options: 'i' } },
                { "user_details.fullName": { $regex: search, $options: 'i' } },
            ]
        }
        let field = "last_message_at";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;
        let pipeline = [
            {
                $match: query
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
                $group: {
                    _id: "$_id",
                    user_ids: { $push: "$user_details._id" },
                    user_details: {
                        $addToSet: {
                            _id: "$user_details._id",
                            fullName: "$user_details.fullName",
                            picture: "$user_details.picture"
                        }
                    },
                    last_message: { $last: "$last_message" },
                    last_message_at: { $last: "$last_message_at" },
                    last_sender: { $last: "$last_sender" },
                    updatedAt: { $last: "$updatedAt" }
                }
            },
            {
                $match: query2
            },
            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $sort: sort_query
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ]
                }
            }

        ]
        let get_chat_rooms = await ChatRooms.aggregate(pipeline);
        return sendResponse(res, get_chat_rooms, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getMessages = async (req, res) => {
    try {
        // console.log("[Message Listing]")
        let { room_id, search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (room_id) { query.room_id = new ObjectId(room_id) };
        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { content: { $regex: search, $options: 'i' } },
            ]
        }
        let field = "createdAt";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    room_id: "$room_id",
                    sender_id: "$sender_id",
                    message_type: "$message_type",
                    content: "$content",
                    media: "$media",
                    reciever_id: "$reciever_id",
                    is_sender_admin: "$is_sender_admin",
                    is_reciever_admin: "$is_reciever_admin",
                    is_read: "$is_read",
                    is_deleted: "$is_deleted",
                    read_at: "$read_at",
                    admin_id: "$admin_id",
                }
            },
            {
                $match: query2
            },
            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $sort: sort_query
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ]
                }
            }

        ]
        let get_messages = await Messages.aggregate(pipeline);
        return sendResponse(res, get_messages, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}