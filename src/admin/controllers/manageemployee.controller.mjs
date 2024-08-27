import { sendResponse } from "../helpers/sendResponse.mjs";
// import { addUserByAdmin , getUsersList , getUserByID , deleteUserService} from "../services/manageuser.service.mjs";
import { getEmployeeService, addEmployeeService } from "../services/manageeemployee.service.mjs";
import { Admin } from "../models/admin.model.mjs";

async function getEmployee(req, res) {
  const pageNo = parseInt(req.query.pageNo);
  const pageSize = parseInt(req.query.pageSize);
  const data = await getEmployeeService(pageNo, pageSize, req)

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken,
    data.additionalData
  );
}

async function addEmployee(req, res) {
  const { body } = req;

  const data = await addEmployeeService(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function getEmployeeById(req, res) {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "ID is required", false, 400);
    }

    let data = await Admin.findById(id, { password: 0 }).lean().exec();
    if (data) {
      return sendResponse(res, data, "Employee details fetched successfully", true, 200);
    }
    return sendResponse(res, {}, "Employee not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function editEmployee(req, res) {
  try {
    let { id } = req.body;
    delete req.body.email;
    delete req.body.password;
    if (!id) {
      return sendResponse(res, {}, "ID is required", false, 400);
    }

    if (req.body.joining_date) {
      req.body.joining_date = new Date(req.body.joining_date);
    }

    let data = await Admin.findByIdAndUpdate(id, req.body, { new: true });
    if (data) {
      return sendResponse(res, null, "Employee details updated successfully", true, 200);
    }
    return sendResponse(res, {}, "Employee not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function deleteEmployee(req, res) {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "ID is required", false, 400);
    }

    let data = await Admin.findByIdAndUpdate(id, { isDeleted: true });
    if (data) {
      return sendResponse(res, null, "Employee deleted successfully", true, 200);
    }
    return sendResponse(res, {}, "Employee not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

export {
  getEmployee,
  addEmployee,
  getEmployeeById,
  editEmployee,
  deleteEmployee
}