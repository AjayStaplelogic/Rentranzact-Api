import { sendResponse } from "../helpers/sendResponse.mjs";
import { addUserByAdmin , getUsersList , getUserByID , deleteUserService , searchUsersService} from "../services/manageuser.service.mjs";

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
  const pageNo =  parseInt(req.query.pageNo);
  const pageSize =  parseInt(req.query.pageSize);

  const data = await getUsersList(body, pageNo , pageSize);

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

async function searchUsers(req, res) {

  const {search , role} = req.query;
  

  const data = await searchUsersService(search, role);


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
  searchUsers,
    addUser,
    userList,
    user,
    deleteUser
}