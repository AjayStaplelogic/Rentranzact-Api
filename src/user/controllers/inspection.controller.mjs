import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import {
  createInspection,
  fetchInspections,
  updateInspectionStatus,
  inspectionEditService,
  getAvailableDatesService,
  getInspectionsByUserID
} from "../services/inspection.service.mjs";
import { Inspection } from "../models/inspection.model.mjs";

async function getAvailableDates(req, res) {
  const { id } = req.params;

  const data = await getAvailableDatesService(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addInspection(req, res) {
  const { body } = req;

  const renterID = req.user.data._id;

  const data = await createInspection(body, renterID);
  

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getInsepction(req, res) {
  const userData = req.user.data;

  const data = await fetchInspections(userData);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function inspectionUpdate(req, res) {
  const id = req.user.data._id;
  const { body } = req;

  const data = await updateInspectionStatus(body, id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function inspectionEdit(req, res) {
  const { body } = req;

  const data = await inspectionEditService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getInspectionRequests(req, res) {
 
  const id = req.user.data._id;
  const role = req.user.data.role;
  const PropertyID = req.params.id;

  const data = await getInspectionsByUserID(id, role, PropertyID)
  sendResponse(res, data.data, data.message, data.status, data.statusCode);


}

export {
  addInspection,
  getInsepction,
  inspectionUpdate,
  inspectionEdit,
  getAvailableDates,
  getInspectionRequests
};
