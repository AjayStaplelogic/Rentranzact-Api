import Blogs from "../../admin/models/blogs.model.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

export const getBlogById = async (req, res) => {
    try {
        let { id, sortyBy } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        if(!sortyBy) {
            sortyBy = "createdAt";
        }
        
        let prev_sort_query = {
            [sortyBy] : -1
        };

        let next_sort_query = {
            [sortyBy] : 1
        };

        let data = await Blogs.findById(id);
        if (data) {
            let resData = {
                current : data,
            }
 
            let get_privious = await Blogs.findOne({
                createdAt : {$lte : data.createdAt},
                _id : {$ne : data._id}
            }).sort(prev_sort_query);
            if(get_privious){
                resData.previous = get_privious;
            }

            let get_next = await Blogs.findOne({
                createdAt : {$gte : data.createdAt},
                _id : {$ne : data._id}
            }).sort(next_sort_query);
            if(get_next){
                resData.next = get_next;
            }

            return sendResponse(res, resData, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}