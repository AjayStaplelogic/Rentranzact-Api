import { Admin } from "../../admin/models/admin.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { Notification } from "../models/notification.model.mjs";
const WEBHOOK_SECRET = process.env.TWAK_TO_WEBHOOK_SECRET;
console.log(WEBHOOK_SECRET, '=======WEBHOOK_SECRET')
import crypto from "crypto"

const getRawBody = (req) => {
    console.log("Get  Raw Body Function")
    return new Promise((resolve, reject) => {
        let rawBody = '';

        req.on('data', (chunk) => {
            rawBody += chunk; // Accumulate the body data
        });

        req.on('end', () => {
            console.log(rawBody, '====rawBody 111')
            resolve(rawBody); // Resolve the body when done
        });

        req.on('error', (err) => {
            reject(err); // Reject the promise on error
        });
    });
}

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
        console.log(req.rawBody, '=====req.rawBody')
        console.log(req.headers, '====req.headers')
        console.log(req.body, '====req.body')
        // console.log(req.query, '====req.query')

        // Manually read the raw body as a Buffer
        // const rawBody = await getRawBody(req);

        // Convert the raw body Buffer to a string
        const rawBody = req.body.toString();
        console.log(rawBody, '====rawBody 2222')


        // Get the signature from the request headers
        const signature = req.headers['x-tawk-signature'];
        console.log(signature, '====signature 2222')

        console.log(verifySignature(rawBody, signature), '===verifySignature(rawBody, signature)')

        // Verify the signature
        if (!verifySignature(rawBody, signature)) {
            console.log('Verification failed')
            // return res.status(400).send('Invalid signature');
        }

        console.log("[Verification successful]")
        // Process the valid webhook data (parse as JSON here)
        const data = JSON.parse(rawBody);
        console.log('Received webhook data:', data, '====data');

        // switch (req.body.event) {
        //     case "chat:start":
        //         Admin.find({ role: "superAdmin" }).then((admins) => {
        //             if (admins && admins.length > 0) {
        //                 for (const admin of admins) {
        //                     const notification_payload = {};
        //                     notification_payload.redirect_to = "";
        //                     notification_payload.notificationHeading = `${req?.body?.visitor?.name ?? ""} started a new chat`;
        //                     notification_payload.notificationBody = `${req?.body?.message?.text ?? ""}`;
        //                     notification_payload.send_to = admin._id;
        //                     notification_payload.is_send_to_admin = true;
        //                     Notification.create(notification_payload).then((create_notification) => {
        //                         if (create_notification) {
        //                             if (create_notification) {
        //                                 if (admin && admin.fcmToken) {
        //                                     const metadata = {
        //                                         "redirectTo": "nowhere",
        //                                     }
        //                                     sendNotification(admin, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, admin.role)
        //                                 }
        //                             }
        //                         }
        //                     });
        //                 }
        //             }
        //         })
        //         break;
        //     case "chat:end":
        //         break;
        // }


        // global.io.broadcast.emit('news', { hello: 'world Testing socket' });
        //    const io = req.app.get('io');
        //    console.log(io, '==io')
        //    io.emit('attachedmanual', { hello: 'world Testing socket' });


        // Send a success response
        res.status(200).send('Webhook received successfully');

    } catch (error) {
        console.error("Error while converting Twitch API data to Slack webhook payload:", error);
        return null;
    }
}