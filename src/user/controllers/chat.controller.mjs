import mongoose from "mongoose";
import { sendResponse } from "../helpers/sendResponse.mjs";
import ChatRooms from "../models/chatRooms.model.mjs";
import Messages from "../models/messages.model.mjs";
import * as ChatValidations from "../validations/chat.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { User } from "../models/user.model.mjs"
import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import * as chatService from "../services/chat.service.mjs";

const ObjectId = mongoose.Types.ObjectId;

export const joinChatRoom = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, ChatValidations.joinChatRoom);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let { user_id, chat_with, is_admin, admin_id, } = req.body;

        const query = {
            is_group: false,
            user_ids: { $all: [user_id, chat_with] }
        }

        if (is_admin && admin_id) {
            query.admin_id = admin_id;
        }

        const room = await ChatRooms.findOne(query).lean().exec();
        if (room) {
            const get_chat_rooms = await chatService.get_room_by_id(room._id)
            return sendResponse(res, get_chat_rooms, "success", true, 200);
        }

        const payload = {
            user_ids: [user_id, chat_with],
            admin_id: admin_id || null
        }

        let create_room = await ChatRooms.create(payload)
        if (create_room) {
            const get_chat_rooms = await chatService.get_room_by_id(create_room._id)
            return sendResponse(res, get_chat_rooms, "success", true, 200);
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
                    user_ids: { $push: "$user_details._id" },
                    user_details: {
                        $addToSet: {
                            _id: "$user_details._id",
                            fullName: "$user_details.fullName",
                            picture: "$user_details.picture"
                        },
                        // $addToSet: {
                        //     _id: "$admin_details._id",
                        //     fullName: "$admin_details.fullName",
                        //     picture: "$admin_details.picture"
                        // }
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
                            is_admin : true
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
                $match: query2
            },
            {
                $unset: ["admin_details"]
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
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "sender_id",
            //         foreignField: "_id",
            //         as: "sender_details"
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$sender_details",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "reciever_id",
            //         foreignField: "_id",
            //         as: "reciever_details"
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$reciever_details",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            {
                $project: {
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
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
                    // sender_details: {
                    //     _id: "$sender_details._id",
                    //     fullName: "$sender_details.fullName",
                    //     picture: "$sender_details.picture"
                    // },
                    // reciever_details: {
                    //     _id: "$reciever_details._id",
                    //     fullName: "$reciever_details.fullName",
                    //     picture: "$reciever_details.picture"
                    // }
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

export const getContacts = async (req, res) => {
    try {
        // console.log("[Message Listing]")
        let { room_id, search, sortBy, user_id } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        let query2 = {};
        if (room_id) { query.room_id = new ObjectId(room_id) };
        let skip = Number(page - 1) * count;
        if (search) {
            query2.$or = [
                { fullName: { $regex: search, $options: 'i' } },
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

        query.role = { $in: Object.values(UserRoles) };
        if (user_id) {
            let get_user = await User.findById(user_id);
            if (get_user) {
                const user_query = {
                    rented: true
                }
                let distinct_key = "";
                if (get_user.role === UserRoles.LANDLORD) {
                    user_query.landlord_id = get_user._id;
                    distinct_key = "renterID";
                } else if (get_user.role === UserRoles.PROPERTY_MANAGER) {
                    user_query.property_manager_id = get_user._id;
                    distinct_key = "renterID";
                } else if (get_user.role === UserRoles.RENTER) {
                    user_query.renterID = get_user._id;
                    distinct_key = "landlord_id";
                }
                const user_ids = await Property.distinct(distinct_key, user_query);
                console.log(user_ids, '====user_ids')
                query._id = { $in: user_ids.map(item => new ObjectId(item)) }
            } else {
                query._id = { $exists: false }       // Just to handle if user id is wrong then not sending any user data
            }
        }
        // console.log(query, '========query')
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    _id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    fullName: "$fullName",
                    role: "$role",
                    picture: "$picture",
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
        let get_messages = await User.aggregate(pipeline);
        return sendResponse(res, get_messages, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}