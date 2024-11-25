import { Admin } from "../../admin/models/admin.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { Notification } from "../models/notification.model.mjs";


export const twawToWebhook = (req, res) => {
    try {
        console.log(req.headers, '====req.headers')
        console.log(req.body, '====req.body')
        console.log(req.query, '====req.query')
        switch (req.body.event) {
            case "chat:start":
                Admin.find({ role: "superAdmin" }).then((admins) => {
                    if (admins && admins.length > 0) {
                        for (const admin of admins) {
                            const notification_payload = {};
                            notification_payload.redirect_to = "";
                            notification_payload.notificationHeading = `${req?.body?.visitor?.name ?? ""} started a new chat`;
                            notification_payload.notificationBody = `${req?.body?.message?.text ?? ""}`;
                            notification_payload.send_to = admin._id;
                            notification_payload.is_send_to_admin = true;
                            Notification.create(notification_payload).then((create_notification) => {
                                if (create_notification) {
                                    if (create_notification) {
                                        if (admin && admin.fcmToken) {
                                            const metadata = {
                                                "redirectTo": "nowhere",
                                            }
                                            sendNotification(admin, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, admin.role)
                                        }
                                    }
                                }
                            });
                        }
                    }
                })
                break;
            case "chat:end":
                break;
        }


        // global.io.broadcast.emit('news', { hello: 'world Testing socket' });
        //    const io = req.app.get('io');
        //    console.log(io, '==io')
        //    io.emit('attachedmanual', { hello: 'world Testing socket' });



    } catch (error) {
        console.error("Error while converting Twitch API data to Slack webhook payload:", error);
        return null;
    }
}