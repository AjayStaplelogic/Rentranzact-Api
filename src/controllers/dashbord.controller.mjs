import { UserRoles } from "../enums/role.enums.mjs";
import { User } from "../models/user.model.mjs";
import { getDashboardStats } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";


async function dashbordStats(req, res) {
   
console.log(req.user.data.role, "------------roleeeee  ")

const role = req.user.data.role;

if (role ===  UserRoles.LANDLORD) {

    const data = await getDashboardStats(req.user.data);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);


}


}

export {dashbordStats}