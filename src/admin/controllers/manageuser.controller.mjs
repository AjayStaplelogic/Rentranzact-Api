import { sendResponse } from "../helpers/sendResponse.mjs";
import { addUserByAdmin , getUsersList , getUserByID , deleteUserService} from "../services/manageuser.service.mjs";

async function addUser(req, res) {
  const { body } = req;

  const data = await addUserByAdmin(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}




async function userList(req, res) {
  const { body } = req;

  const data = await getUsersList(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function user(req, res) {

  const { id } = req.params;

  const data = await getUserByID(id);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function deleteUser(req, res) {
  const { id } = req.params;

  const data = await deleteUserService(id);

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
    addUser,
    userList,
    user,
    deleteUser
}