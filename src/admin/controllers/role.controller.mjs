import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRoleService, getRoleService, deleteRoleService, updateRoleService } from "../services/role.service.mjs";

async function addRole(req, res) {

  const { body } = req;

  const data = await addRoleService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}


async function getRole(req, res) {

  const { body } = req;

  const data = await getRoleService(body, req);

  sendResponse(res, data.data, data.message, data.status, data.statusCode, data.accessToken, data.additionalData);
}

async function deleteRole(req, res) {
  const { id } = req.params;

  const data = await deleteRoleService(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function updateRoles(req, res) {
  const { id } = req.params;
  const { permissions } = req.body;

  const data = await updateRoleService(id, permissions);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}


export { addRole, getRole, deleteRole, updateRoles };
