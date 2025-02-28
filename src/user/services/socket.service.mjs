import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.mjs";
import * as chatService from "../services/chat.service.mjs";

const connected_users = [];
const io = new Server();

io.use(async (socket, next) => {
    if (!socket?.handshake?.headers["authorization"]) {
        return next(new Error('No headers provided'));
    }

    if (socket?.handshake?.headers["authorization"]) {
        let token_arr = socket?.handshake?.headers["authorization"].split(' ');
        if (token_arr.length < 2) {
            return next(new Error("Invalid authorization header"));
        }
        if (token_arr[0] == "Bearer" && token_arr[1]) {
            try {
                if (token_arr[1] === process.env.ADMIN_JWT_ACCESS_TOKEN_SECRET) {
                    if (socket?.handshake?.headers["admin-id"]) {
                        socket["is_admin"] = true;
                        socket["admin_id"] = socket?.handshake?.headers["admin-id"]
                        socket["user_id"] = socket?.handshake?.headers["admin-id"]
                        return next();
                    }
                    return next(new Error("Admin Id required"));
                }

                const decoded = jwt.verify(token_arr[1], process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decoded.data && decoded.data._id) {
                    let get_user = await User.findById(decoded.data._id).lean().exec();
                    if (get_user) {
                        socket["user_id"] = get_user._id;
                        socket["fullName"] = get_user.fullName;
                        socket["email"] = get_user.email;
                        socket["role"] = get_user.role;
                        socket["is_admin"] = false;
                        return next()
                    }
                    return next(new Error("Invalid authentication"))
                }
                return next(new Error("Invalid authentication"))

            } catch (error) {
                return next(new Error(error.message))
            }
        }
        return next(new Error("Invalid authorization type"));
    }
    next()
});

io.on('connection', (socket) => {
    chatService.user_online(socket, connected_users);
    chatService.join_multiple_rooms(socket);
    io.emit("user-online", {        // sending to all client about user login
        status: true,
        statusCode: 200,
        data: {
            user_id: socket.user_id,
            is_admin: socket.is_admin,
        }
    });

    socket.on("join-room", async (data) => {
        let room = await chatService.get_room_by_id(data.room_id);
        if (room) {
            let members = room?.user_ids;
            let room_id = `${room?._id}`
            if (members && members.length > 0) {
                for await (let member of members) {
                    let socket_ids = await chatService.get_user_socket_ids(connected_users, `${member}`);
                    if (socket_ids && socket_ids.length > 0) {
                        for (let socket_id of socket_ids) {
                            io.in(socket_id).socketsJoin(room_id);
                        }
                    }
                }
            }
            io.in(room_id).emit("join-room", {        // sending to current user only
                status: true,
                statusCode: 200,
                data: room
            });
        }
    })

    socket.on("join-private-room", async (data) => {
        let room = await chatService.join_private_room(socket, data);
        if (room) {
            let members = room?.room?.user_ids;
            let room_id = `${room?.room?._id}`
            if (members && members.length > 0) {
                for await (let member of members) {
                    let socket_ids = await chatService.get_user_socket_ids(connected_users, `${member}`);
                    if (socket_ids && socket_ids.length > 0) {
                        for (let socket_id of socket_ids) {
                            io.in(socket_id).socketsJoin(room_id);
                        }
                    }
                }
            }
            io.in(room_id).emit("join-private-room", {        // sending to current user only
                status: true,
                statusCode: 200,
                data: room?.room ?? ""
            });
        }
    })

    socket.on("new-message", async (data) => {
        let message = await chatService.send_message(socket, data)
        let get_room = await chatService.get_room_by_id(data.room_id, socket.user_id);
        io.in(`${message.room_id}`).emit("new-message", {
            status: true,
            statusCode: 200,
            data: message
        });

        io.in(`${message.room_id}`).emit("private-room-updated", { // sending to sender and reciever
            status: true,
            statusCode: 200,
            data: get_room
        });

        chatService.get_unread_chats_count(io, connected_users, message.reciever_id)
    })

    socket.on("read-message", async (data) => {
        let message = await chatService.read_message(socket, data);
        if (message) {
            socket.to(`${message.room_id}`).emit("read-message", {
                status: true,
                statusCode: 200,
                data: message
            })
        }
    })

    socket.on("read-multiple-messages", async (data) => {
        chatService.read_multiple_messages(io, socket, data);
    })

    socket.on("typing", async (data) => {
        data.user_id = socket.user_id;
        socket.to(data.room_id).emit("typing", {
            status: true,
            statusCode: 200,
            data: data
        })
    })

    socket.on("delete-message", async (data) => {
        let delete_message = await chatService.delete_message(data.message_id);
        if (delete_message) {
            io.in(`${delete_message.room_id}`).emit("delete-message", {
                status: true,
                statusCode: 200,
                data: data
            });

            let get_room = await chatService.get_room_by_id(delete_message.room_id);
            io.in(`${delete_message.room_id}`).emit("private-room-updated", { // sending to sender and reciever
                status: true,
                statusCode: 200,
                data: get_room
            });
        } else {
            io.to(socket.id).emit("delete-message", {
                status: false,
                statusCode: 400,
                message: "Invalid message id"
            });
        }
    })

    socket.on('user-offline', () => {
        chatService.user_offline(socket, connected_users);
        io.emit("user-offline", {        // sending to all client about user logout/offline
            status: true,
            statusCode: 200,
            data: {
                user_id: socket.user_id,
                is_admin: socket.is_admin,
            }
        })
    });

    socket.on('notification-count', async (data) => {
        const unread_count = await chatService.unread_notification_count(data.user_id)
        let socket_ids = await chatService.get_user_socket_ids(connected_users, data.user_id);
        if (socket_ids && socket_ids.length > 0) {
            for (let socket_id of socket_ids) {
                io.in(socket_id).emit("notification-count", {
                    status: true,
                    statusCode: 200,
                    data: {
                        unread_count: unread_count
                    }
                });
            }
        }
    });

    socket.on("unread-chats-count", async () => {
        console.log(socket.user_id, '========= socket user_id')
        chatService.get_unread_chats_count(io, connected_users, socket.user_id)
    })

    socket.on('disconnect', () => {
        chatService.user_offline(socket, connected_users);
        io.emit("user-offline", {        // sending to all client about user logout/offline
            status: true,
            statusCode: 200,
            data: {
                user_id: socket.user_id,
                is_admin: socket.is_admin,
            }
        })
    });
})

io.on("connection_error", (err) => {
});

io.on("close", (socket) => {
    chatService.user_online(socket, connected_users);
});


/**
 * @description Fetch unread notification count from Db and emit event to user
 * @param {String} user_id Fetch and emit to that user
 * @return {void} Nothing
 */
const sendNotificationCount = async (user_id) => {
    const unread_count = await chatService.unread_notification_count(user_id)
    const socket_ids = await chatService.get_user_socket_ids(connected_users, `${user_id}`);
    if (socket_ids && socket_ids.length > 0) {
        for (let socket_id of socket_ids) {
            io.to(socket_id).emit("notification-count", {
                status: true,
                statusCode: 200,
                data: {
                    unread_count: unread_count
                }
            })
        }
    }
}

export const controllerEvents = {
    notification_count: sendNotificationCount
}

export default io;