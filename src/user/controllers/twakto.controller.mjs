import { Admin } from "../../admin/models/admin.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { Notification } from "../models/notification.model.mjs";
const WEBHOOK_SECRET = process.env.TWAK_TO_WEBHOOK_SECRET;
import crypto from "crypto";
import * as NotificationService from "../services/notification.service.mjs"
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";

const verifySignature = (body, signature) => {
    const digest = crypto
        .createHmac('sha1', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

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
                        }
                    }
                })
                break;
            case "chat:end":
                break;
        }

        // Send a success response
        res.status(200).send('Webhook received successfully');

    } catch (error) {
        return null;
    }
}