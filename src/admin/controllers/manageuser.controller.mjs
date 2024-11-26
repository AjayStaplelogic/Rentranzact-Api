import { User } from "../../user/models/user.model.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addUserByAdmin, getUsersList, getUserByID, deleteUserService, searchUsersService, changeStatus } from "../services/manageuser.service.mjs";
import { EACCOUNT_STATUS } from "../../user/enums/user.enum.mjs";

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
  const data = await getUsersList(req);
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

  const { search, role } = req.query;


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

async function updateAccountStatus(req, res) {
  try {
    let { id, account_status } = req.body;
    if (!id) {
      return sendResponse(res, null, "Id is required", false, 400);
    }
    if (!account_status) {
      return sendResponse(res, null, "Account status is required", false, 400);
    }

    let payload = {};
    if (account_status === EACCOUNT_STATUS.active) {
      payload.account_status = EACCOUNT_STATUS.active;
      payload.activatedAt = new Date();
    } else if (account_status === EACCOUNT_STATUS.suspended) {
      payload.account_status = EACCOUNT_STATUS.suspended;
      payload.suspendedAt = new Date();
    } else if (account_status === EACCOUNT_STATUS.blacklisted) {
      payload.account_status = EACCOUNT_STATUS.blacklisted;
      payload.blacklistedAt = new Date();
    } else {
      return sendResponse(res, null, "Invalid account status", false, 400);
    }

    let update_user = await User.findByIdAndUpdate(id, payload, { new: true });
    if (update_user) {
      return sendResponse(res, null, "User account status updated successfully", true, 200);
    }
    return sendResponse(res, null, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, null, `${error}`, false, 400)
  }
};

async function getAllUsersDropdown(req, res) {
  try {
    let { role, search, sortBy } = req.query;
    const query = {
      deleted: false
    };
    if (role) { query.role = role };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
      ]
    }
    let field = "rating";
    let order = "desc";
    let sort_query = {};
    if (sortBy) {
      field = sortBy.split(' ')[0];
      order = sortBy.split(' ')[1];
    }
    sort_query[field] = order == "desc" ? -1 : 1;
    const pipeline = [
      {
        $match: query
      },
      {
        $project: {
          createdAt: "$createdAt",
          email: "$email",
          role: "$role",
          fullName: "$fullName"
        }
      }
    ]
    const data = await User.aggregate(pipeline);
    return sendResponse(res, data, "success", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

export {
  searchUsers,
  addUser,
  userList,
  user,
  deleteUser,
  updateStatus,
  updateAccountStatus,
  getAllUsersDropdown
}