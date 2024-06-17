import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import {
  createInspection,
  fetchInspections,
  updateInspectionStatus,
  inspectionEditService
} from "../services/inspection.service.mjs";
async function addInspection(req, res) {
  const { body } = req;

  const renterID = req.user.data._id;

  const data = await createInspection(body, renterID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getInsepction(req, res) {
  const userData = req.user.data;

  const data = await fetchInspections(userData);
  console.log(data , '.................data')

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function inspectionUpdate(req, res) {
  const id = req.user.data._id;
  const {body} = req;

  const data = await updateInspectionStatus(body,id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}


async function inspectionEdit(req, res) {

  const {body} = req;

  const data = await inspectionEditService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addInspection, getInsepction, inspectionUpdate , inspectionEdit };
