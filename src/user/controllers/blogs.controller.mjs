import Blogs from "../../admin/models/blogs.model.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

export const getBlogById = async (req, res) => {
    try {
        let { id, previous_id, next_id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Blogs.findById(id);
        if (data) {
            let resData = {
                current: data,
            }

            if (previous_id) {
                let get_privious = await Blogs.findById(previous_id);
                if (get_privious) {
                    resData.previous = get_privious;
                }
            }

            if (next_id) {
                let get_next = await Blogs.findById(next_id);
                if (get_next) {
                    resData.next = get_next;
                }
            }

            return sendResponse(res, resData, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}