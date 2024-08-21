import { UserRoles } from "../enums/role.enums.mjs";
import { User } from "../models/user.model.mjs";
import { getDashboardStats , getDashboardStatsPM } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";


async function dashbordStats(req, res) {
   
const role = req.user.data.role;

if (role ===  UserRoles.LANDLORD) {
    const data = await getDashboardStats(req.user.data);
    sendResponse(res, data.data, data.message, data.status, data.statusCode);
} else if (role === UserRoles.PROPERTY_MANAGER) {

    const data = await getDashboardStatsPM(req.user.data) 
    sendResponse(res, data.data, data.message, data.status, data.statusCode);

}


}

export {dashbordStats}