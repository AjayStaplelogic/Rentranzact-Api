import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.mjs";
import * as chatService from "../services/chat.service.mjs";

const connected_users = [];

const io = new Server()
// io.origins("*")
io.use(async (socket, next) => {
    console.log(`[Socket Handshake]`)
    console.log(socket.handshake)
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
                if (token_arr[1] == process.env.ADMIN_JWT_ACCESS_TOKEN_SECRET) {
                    if (socket?.handshake?.headers["admin_id"]) {
                        socket["is_admin"] = true;
                        socket["admin_id"] = socket?.handshake?.headers["admin_id"]
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
    console.log(`[socket connected][socket Id] : ${socket.id}`)
    console.log(`[socket connected][user_id] : ${socket.user_id}`)

    chatService.user_online(socket, connected_users);
    chatService.join_multiple_rooms(socket);
    console.log(connected_users)
    console.log(socket.rooms)

    io.emit("user-online", {        // sending to all client about user login
        status: true,
        statusCode: 200,
        data: {
            user_id: socket.user_id,
            is_admin: socket.is_admin,
            admin_id: socket.admin_id
        }
    });

    socket.on("join-private-room", async (data) => {
        let room = await chatService.join_private_room(socket, data);
        if (room) {
            let members = room?.room?.user_ids;
            let room_id = `${room?.room?.id}`
            if (members && members.length > 0) {
                for await (let member of members) {
                    let socket_ids = await chatService.get_user_socket_ids(connected_users, `${member}`);
                    if (socket_ids && socket_ids.length > 0) {
                        for (let socket_id of socket_ids) {
                            console.log(`[socket_id] ${socket_id}`)
                            console.log(`[room_id] ${room_id}`);
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
        // let reciever_sockets = [socket.id];
        let message = await chatService.send_message(socket, data)
        // if (!data.is_reciever_admin && data.reciever_id) {
        //     let socket_ids = await chatService.get_user_socket_ids(connected_users, data.reciever_id);
        //     // reciever_sockets = [...reciever_sockets, ...socket_ids];
        // } else if (data.is_reciever_admin) {
        //     let admin_socket_ids = await chatService.get_admin_socket_ids(connected_users);
        //     // reciever_sockets = [...reciever_sockets, ...admin_socket_ids];
        // }
        // if (reciever_sockets.length > 0) {
        let get_room = await chatService.get_room_by_id(data.room_id);
        // for (let socket_id of reciever_sockets) {     // sending to sender and reciever
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
        // }
        // }
    })

    socket.on("read-message", async (data) => {
        console.log(`[Event]-[Read-Message]`)
        let message = await chatService.read_message(socket, data);
        if (message) {
            // let socket_ids = await chatService.get_user_socket_ids(connected_users, `${message.sender_id}`)
            // if (socket_ids && socket_ids.length > 0) {
            // for (let socket_id of socket_ids) {     // sending to sender
            socket.to(`${message.room_id}`).emit("read-message", {
                status: true,
                statusCode: 200,
                data: message
            })
            // }
            // }
        }
    })

    socket.on("typing", async (data) => {
        // let get_room = await ChatRooms.findById(data.room_id).lean().exec();
        // if(get_room){
        //     let members = get_room.user_ids.filter(member => member != socket.user_id);
        //    console.log(members, '===members')
        //     if(members && members.length > 0){
        //         for (let member of members){
        //             let socket_ids = await chatService.get_user_socket_ids(connected_users, member);
        //             if(socket_ids && socket_ids.length > 0){
        //                 for (let socket_id of socket_ids){
        //                     data.user_id = member;
        //                     data.typing = true;
        //                     console.log(socket_id, "socketid");
        //                     socket.to(socket_id).emit("typing", {
        //                         status: true,
        //                         statusCode: 200,
        //                         data: data
        //                     })
        //                 }
        //             }
        //         }
        //     }
        // }

        data.user_id = socket.user_id;
        data.typing = true;
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

    socket.on('disconnect', () => {
        console.log(`[socket disconnected] : ${socket.id}`);
        chatService.user_offline(socket, connected_users);
        // console.log(connected_users, '====disconnected')

        io.emit("user-offline", {        // sending to all client about user logout/offline
            status: true,
            statusCode: 200,
            data: {
                user_id: socket.user_id,
                is_admin: socket.is_admin,
                admin_id: socket.admin_id
            }
        })
    });


})

io.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
});

io.on("close", (socket) => {
    console.log(`[socket closed] : ${socket.id}`);
    chatService.user_online(socket, connected_users);
    console.log(connected_users)
});

export default io;