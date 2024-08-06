import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addMaintenanceRequests, getMaintenanceRequestsRenter , getMaintenanceRequestsLandlord , resolveMaintenanceRequests  , addRemarkToRequest} from "../services/maintenance.service.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

async function addMaintenance(req, res) {
  const { body } = req;

  const id = req.user.data._id;

  body.renterID = id;

  const data = await addMaintenanceRequests(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getMaintenanceRenter(req, res) {

  const id = req.user.data._id;

  if (req?.user?.data?.role === UserRoles.RENTER) {

    const data = await getMaintenanceRequestsRenter(id, req);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);


  } else if (req?.user?.data?.role === UserRoles.LANDLORD) {

    const data = await getMaintenanceRequestsLandlord(id, req);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);

  }

  console.log(`[Maintenance]:[Not Matched Any Request]`)
}

async function resolveMaintenance(req, res) {
 
  const { id } = req.params;

  const data = await resolveMaintenanceRequests(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addRemark(req, res) {
 
  const { landlordRemark , maintenanceID } = req.body;

  const data = await addRemarkToRequest(landlordRemark , maintenanceID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}


export { addMaintenance, getMaintenanceRenter  , resolveMaintenance , addRemark};
