import { newsletter } from "../models/newsletter.model.mjs";
import { Notification } from "../models/notification.model.mjs"


async function getNotificationService(userID) {
    

    const data = await Notification.find({ renterID: userID }).sort({createdAt : -1})

    return {
        data: data,
        message: "notification fetched successfully",
        status: true,
        statusCode: 200,
    };
}

export { getNotificationService };
