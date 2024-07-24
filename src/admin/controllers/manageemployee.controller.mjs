import { sendResponse } from "../helpers/sendResponse.mjs";
// import { addUserByAdmin , getUsersList , getUserByID , deleteUserService} from "../services/manageuser.service.mjs";
import { getEmployeeService , addEmployeeService} from "../services/manageeemployee.service.mjs";

async function getEmployee(req, res) {
    const pageNo =  parseInt(req.query.pageNo);
    const pageSize =  parseInt(req.query.pageSize);
    const data = await getEmployeeService(pageNo, pageSize)
  
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


export {
  getEmployee,
  addEmployee
}