import { User } from "../../user/models/user.model.mjs";
import { Admin } from "../models/admin.model.mjs";
import { Notification } from "../../user/models/notification.model.mjs";
import sendNotification from "../../user/helpers/sendNotification.mjs";
import { controllerEvents } from "../../user/services/socket.service.mjs"


const sendNotifications = async (roleModel, roles, notification_content, is_admin) => {
    try {
        // Fetch the users or admins based on the role
        const query = {
            role: { $in: roles },
            [is_admin ? "isDeleted" : "deleted"]: false,
        };

        const usersOrAdmins = await roleModel.find(query);
        if (usersOrAdmins?.length > 0) {
            // Process each user/admin
            const notificationsPromises = usersOrAdmins.map(async (userOrAdmin) => {
                const notification_payload = {
                    ...notification_content,
                    send_to: userOrAdmin._id,
                    is_send_to_admin: is_admin,  // Only true for admin notifications
                };

                // Create notification
                const create_notification = await Notification.create(notification_payload);
                if (create_notification) {
                    controllerEvents.notification_count(userOrAdmin._id)
                    if (userOrAdmin?.fcmToken) {
                        const metadata = { redirectTo: "" }; // Adjust metadata as needed
                        sendNotification(userOrAdmin, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, userOrAdmin.role);
                    }
                }
            });

            // Wait for all notifications to be sent
            await Promise.all(notificationsPromises);
        }
    } catch (error) {
    }
};

export const sendNotificationsToRoles = async (roles = [], is_admin = false, notification_content) => {
    try {
        if (is_admin) {
            await sendNotifications(Admin, roles, notification_content, true);
        } else {
            await sendNotifications(User, roles, notification_content, false);
        }
    } catch (error) {
    }
};
