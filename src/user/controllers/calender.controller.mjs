import { UserRoles } from "../enums/role.enums.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addToCalender } from "../services/calender.service.mjs";


async function calender(req, res) {
   
const {role , _id} = req.user.data;
const {body} = req;

if (role === UserRoles.LANDLORD) {

    const data = await addToCalender(body , _id);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);

}


}

export {calender}