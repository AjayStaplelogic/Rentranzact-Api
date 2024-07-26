import { UserRoles } from "../enums/role.enums.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addToCalender  , getToCalender , getRenterCalender , getTimeSlotByDate} from "../services/calender.service.mjs";


async function calender(req, res) {

    const { role, _id } = req.user.data;
    const { body } = req;
   

    if (role === UserRoles.LANDLORD) {

        const data = await addToCalender(body, _id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    }

}

async function getCalender(req, res) {

    const { _id , role } = req.user.data;
    const {propertyID} = req.query;


    if (role === UserRoles.LANDLORD) {

        const data = await getToCalender(_id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    } else if (role === UserRoles.RENTER) {

        const data = await getRenterCalender(_id, propertyID);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);


    }

}
async function getTimeSlot(req, res) {

    const { role, _id } = req.user.data;
    const { date } = req.params;
   

    if (role === UserRoles.RENTER) {

        const data = await getTimeSlotByDate(date, _id);

        sendResponse(res, data.data, data.message, data.status, data.statusCode);

    }

}


export { calender, getCalender , getTimeSlot }