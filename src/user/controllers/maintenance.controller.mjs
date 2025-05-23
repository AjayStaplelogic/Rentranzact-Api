import { sendResponse } from "../helpers/sendResponse.mjs";
import { addMaintenanceRequests, getMaintenanceRequestsRenter, getMaintenanceRequestsLandlord, resolveMaintenanceRequests, addRemarkToRequest, cancelMaintenanceRequests, getMaintenanceRequestsPropertyManager } from "../services/maintenance.service.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { Maintenance } from "../models/maintenance.model.mjs"
import { User } from "../models/user.model.mjs";
import MaintenanceRemarks from "../models/maintenanceRemarks.model.mjs"

async function addMaintenance(req, res) {
  const { body } = req;

  const id = req.user.data._id;

  const data = await addMaintenanceRequests(body, req);

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

  const data = await resolveMaintenanceRequests(id, req);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addRemark(req, res) {

  const { landlordRemark, maintenanceID } = req.body;

  const data = await addRemarkToRequest(req);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function cancelMaintenace(req, res) {

  const { id } = req.params;

  const data = await cancelMaintenanceRequests(id, req);

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

    switch (req.user.data.role) {
      case UserRoles.RENTER:
        query.renterID = req.user.data._id;
        break;

      case UserRoles.LANDLORD:
        query.landlordID = req.user.data._id;
        break;

      case UserRoles.PROPERTY_MANAGER:
        query.property_manager_id = req.user.data._id;
        break;
    }
    const data = await Maintenance.findById(query)
      .populate("propertyID", "propertyName images")
      .lean().exec();
    if (data) {
      if (data.renterID) {
        data.renterDetails = await User.findById(data.renterID, {
          picture: 1,
          fullName: 1,
          phone: 1,
          email: 1
        })

        data.remaks = await MaintenanceRemarks.find({ maintenance_request_id: data._id }).
          populate("user_id", "fullName picture")
      }
      return sendResponse(res, data, "Maintenance Details", true, 200)
    }
    return sendResponse(res, null, "No maintenance found", false, 404)

  } catch (error) {
    return sendResponse(res, null, error?.message, false, 400)
  }
}
export { addMaintenance, getMaintenanceRenter, resolveMaintenance, addRemark, cancelMaintenace, getMaintenanceDetails };
