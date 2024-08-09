
import { sendResponse } from "../helpers/sendResponse.mjs";

export const uploadSingleImage = (req, res) => {
    try {
        // console.log(req.body, '====req.body')
        console.log(req.file, '====req.files');
        if (req.file) {
            let resObj = { ...req.file }
            resObj.fullPath = `${process.env.HOST_URL}${req.file.path}`;
            return sendResponse(res, resObj, "success", true, 200);

        }

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);

    }
}