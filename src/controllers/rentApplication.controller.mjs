import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRentApplicationService, rentApplicationsList, updateRentApplications, getRentApplicationsByUserID } from "../services/rentapplication.service.mjs"

async function addRentApplication(body, fileUrl, res, renterID) {

  const data = await addRentApplicationService(body, fileUrl, renterID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function rentApplications(req, res) {

  const userData = req.user.data;
  const data = await rentApplicationsList(userData);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function rentApplicationUpdate(req, res) {

  const id = req.user.data._id;
  const { body } = req;

  const data = await updateRentApplications(body, id);


  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getRentApplications(req, res) {

  const id = req.user.data._id;
  const role = req.user.data.role;
  const PropertyID = req.params.id;

  const data = await getRentApplicationsByUserID(id, role, PropertyID)
  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

export { addRentApplication, rentApplications, rentApplicationUpdate, getRentApplications };
