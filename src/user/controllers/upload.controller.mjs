
import { sendResponse } from "../helpers/sendResponse.mjs";

export const uploadSingleImage = (req, res) => {
    try {
        if (req.file) {
            let resObj = { ...req.file }
            resObj.fullPath = `${process.env.HOST_URL}images/${req.file.filename}`;
            return sendResponse(res, resObj, "success", true, 200);
        }
        return sendResponse(res, {}, "File not found", false, 400);

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);

    }
}