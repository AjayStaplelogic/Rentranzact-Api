import { sendResponse } from "../helpers/sendResponse.mjs";
// import { addUserByAdmin , getUsersList , getUserByID , deleteUserService} from "../services/manageuser.service.mjs";
import { getEmployeeService , addEmployeeService} from "../services/manageeemployee.service.mjs";

async function getEmployee(req, res) {
    const { body } = req;
  
    const data = await getEmployeeService(body);
  
    sendResponse(
      res,
      data.data,
      data.message,
      data.status,
      data.statusCode,
      data.accessToken
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