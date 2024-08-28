import { User } from "../../user/models/user.model.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addUserByAdmin , getUsersList , getUserByID , deleteUserService , searchUsersService , changeStatus} from "../services/manageuser.service.mjs";

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

async function updateStatus(req, res) {


  const { id } = req.params;

  const data = await changeStatus(id);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function updateAccountStatus (req, res) {
  try {
    let {id, account_status} = req.body;
    if(!id){
      return sendResponse(res, null, "Id is required", false, 400);
    }
    if(!account_status){
      return sendResponse(res, null, "Account status is required", false, 400);
    }

    let payload = {};
    if(account_status === "suspended"){
      payload.account_status = "suspended";
      payload.suspendedAt = new Date();
    }else if(account_status === "blacklisted"){
      payload.account_status = "blacklisted";
      payload.blacklistedAt = new Date();
    }else{
      return sendResponse(res, null, "Invalid account status", false, 400);
    }

    let update_user = await User.findByIdAndUpdate(id, payload, {new : true});
    if(update_user){
      return sendResponse(res, null, "User account status updated successfully", true, 200);
    }
    return sendResponse(res, null, "User not found", false, 404);
  } catch (error) {
    return  sendResponse(res, null, `${error}`, false, 400)
  }
};

export {
  searchUsers,
    addUser,
    userList,
    user,
    deleteUser,
    updateStatus,
    updateAccountStatus
}