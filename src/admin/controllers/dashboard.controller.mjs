// import { UserRoles } from "../enums/role.enums.mjs";
// import { User } from "../models/user.model.mjs";
// import { getDashboardStats } from "../services/dashboard.service.mjs";
import { getDashboardStats } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

async function dashboard(req, res) {
  const data = await getDashboardStats();

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { dashboard };
