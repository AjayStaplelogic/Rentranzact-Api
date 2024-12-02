import { Admin } from "../../admin/models/admin.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { Notification } from "../models/notification.model.mjs";
const WEBHOOK_SECRET = process.env.TWAK_TO_WEBHOOK_SECRET;
import crypto from "crypto";
import * as NotificationService from "../services/notification.service.mjs"
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";

const verifySignature = (body, signature) => {
    console.log("Verify Signature Function")

    const digest = crypto
        .createHmac('sha1', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

    console.log(digest, '=====digest-signature', signature)
    return signature === digest;
};


export const twawToWebhook = async (req, res) => {
    try {
        // Convert the raw body Buffer to a string
        const rawBody = JSON.stringify(req.body);

        // Get the signature from the request headers
        const signature = req.headers['x-tawk-signature'];


        // Verify the signature
        if (!verifySignature(rawBody, signature)) {
            return res.status(400).send('Invalid signature');
        }


        switch (req.body.event) {
            case "chat:start":
                Admin.find({ role: "superAdmin" }).then((admins) => {
                    if (admins && admins.length > 0) {
                        for (const admin of admins) {
                            const notification_payload = {};
                            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.tawk_to_dashboard;
                            notification_payload.notificationHeading = `${req?.body?.visitor?.name ?? ""} started a new chat`;
                            notification_payload.notificationBody = `${req?.body?.message?.text ?? ""}`;
                            notification_payload.send_to = admin._id;
                            notification_payload.is_send_to_admin = true;

                            const metadata = {
                                "redirectTo": ENOTIFICATION_REDIRECT_PATHS.tawk_to_dashboard
                            }
                            NotificationService.createNotification(notification_payload, metadata, admin);

                            // Notification.create(notification_payload).then((create_notification) => {
                            //     if (create_notification) {
                            //         if (create_notification) {
                            //             if (admin && admin.fcmToken) {
                            //                 const metadata = {
                            //                     "redirectTo": "nowhere",
                            //                 }
                            //                 sendNotification(admin, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, admin.role)
                            //             }
                            //         }
                            //     }
                            // });
                        }
                    }
                })
                break;
            case "chat:end":
                break;
        }


        // global.io.broadcast.emit('news', { hello: 'world Testing socket' });
        // const io = req.app.get('io');
        // // console.log(io, '==io')
        // let socket_ids = await chatService.get_user_socket_ids(data.connected_users, "66a21b414ee1be84903a0076");
        // console.log(socket_ids, '==socket_ids')
        // if (socket_ids && socket_ids.length > 0) {
        //     for (let socket_id of socket_ids) {
        //         // console.log(`[socket_id] ${socket_id}`)
        //         io.to(socket_id).emit("notification-count", {
        //             status: true,
        //             statusCode: 200,
        //             data: "data"
        //         })
        //         io.emit('notification-count', { hello: 'world Testing socket' });
        //     }
        // }


        // controllerEvents.notification_count("66a21b414ee1be84903a0076")
        // Send a success response
        res.status(200).send('Webhook received successfully');

    } catch (error) {
        console.error("Error while converting Twitch API data to Slack webhook payload:", error);
        return null;
    }
}