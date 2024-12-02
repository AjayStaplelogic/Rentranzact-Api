import { Notification } from "../models/notification.model.mjs";
import { User } from "../models/user.model.mjs";
import { Admin } from "../../admin/models/admin.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { controllerEvents } from "./socket.service.mjs"

async function getNotificationService(userID) {
    const data = await Notification.find({ renterID: userID }).sort({ createdAt: -1 })

    return {
        data: data,
        message: "notification fetched successfully",
        status: true,
        statusCode: 200,
    };
}

/**
 * @description To create a notification and send it using firebase and emit notification count socket event
 * @param {Object} payload Object containing the notification data to be created
 * @param {Object} metadata Object containing the notification metadata to be sent in firebase notification
 * @param {Object} user_details Object containing the user details or admin details to be sent on
 * @param {void} Nothing
 */
export const createNotification = (payload, metadata = {}, user_details = null) => {
    Notification.create(payload).then(async (create_notification) => {
        if (create_notification) {

            if (!user_details) {
                let Model = User;
                if (create_notification.is_send_to_admin) {
                    Model = Admin;
                }
                user_details = await Model.findOne({
                    _id: create_notification.send_to
                })
            }

            controllerEvents.notification_count(`${user_details._id}`)
            if (user_details && user_details.fcmToken) {
                sendNotification(user_details, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, user_details.role)
            }
        }
    });
}

export { getNotificationService };
