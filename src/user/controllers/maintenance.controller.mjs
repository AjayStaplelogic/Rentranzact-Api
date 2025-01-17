import { sendResponse } from "../helpers/sendResponse.mjs";
import { addMaintenanceRequests, getMaintenanceRequestsRenter, getMaintenanceRequestsLandlord, resolveMaintenanceRequests, addRemarkToRequest, cancelMaintenanceRequests, getMaintenanceRequestsPropertyManager } from "../services/maintenance.service.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { Maintenance } from "../models/maintenance.model.mjs"
import { User } from "../models/user.model.mjs";

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

  } else if (req?.user?.data?.role === UserRoles.PROPERTY_MANAGER) {

    const data = await getMaintenanceRequestsPropertyManager(id, req);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);

  }
}

async function resolveMaintenance(req, res) {

  const { id } = req.params;

  const data = await resolveMaintenanceRequests(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addRemark(req, res) {

  const { landlordRemark, maintenanceID } = req.body;

  const data = await addRemarkToRequest(landlordRemark, maintenanceID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function cancelMaintenace(req, res) {

  const { id } = req.params;

  const data = await cancelMaintenanceRequests(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getMaintenanceDetails(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return sendResponse(res, null, "Missing ID", false, 400)
    }

    const query = {
      _id: id
    };

    const data = await Maintenance.findById(query).lean().exec();
    if (data) {
      if (data.renterID) {
        data.renterDetails = await User.findById(data.renterID, {
          picture: 1,
          fullName: 1,
          phone: 1,
          email: 1
        })
      }
      return sendResponse(res, data, "Maintenance Details", true, 200)
    }
    return sendResponse(res, null, "No maintenance found", false, 404)

  } catch (error) {
    return sendResponse(res, null, error?.message, false, 400)
  }
}


export { addMaintenance, getMaintenanceRenter, resolveMaintenance, addRemark, cancelMaintenace, getMaintenanceDetails };
