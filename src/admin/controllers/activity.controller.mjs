import { sendResponse } from "../helpers/sendResponse.mjs";
import { Activity } from "../models/activity.model.mjs";

async function activity(req, res) {

    try {
        const { userID } = req.params;

        const data = await Activity.find({empID : userID})

        sendResponse(res, data, "activity fetched successfully", true, 200);

    } catch (error) {
        sendResponse(res, data, error, false, 400);
    }


}

export { activity }