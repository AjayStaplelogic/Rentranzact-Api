import { Property } from "../../user/models/property.model.mjs";
import { UserRoles } from "../../user/enums/role.enums.mjs";
import { User } from "../../user/models/user.model.mjs";
import pkg from "bcrypt";
import activityLog from "../helpers/activityLog.mjs";
import * as referralService from "../../user/services/referral.service.mjs";
import CreditScores from "../../user/models/creditscore.model.mjs";
import { Admin } from "../models/admin.model.mjs";
import ConnectedAccounts from "../../user/models/connectedAccounts.model.mjs";
import BankAccounts from "../../user/models/bankAccounts.model.mjs";

async function addUserByAdmin(body) {

  let { password, role, email, current_user_id } = body;

  const isUser = await User.exists({ email: email, deleted: false })

  if (isUser) {
    return {
      data: [],
      message: "user already exist",
      status: false,
      statusCode: 401,
    };
  } else {

    const salt = parseInt(process.env.SALT);

    const hashedPassword = await new Promise((resolve, reject) => {
      pkg.hash(password, salt, function (err, hash) {
        if (err) {
          reject(err); // Reject promise if hashing fails
        } else {
          resolve(hash); // Resolve promise with hashed password
        }
      });
    });

    body.password = hashedPassword;
    body.myCode = await referralService.generateMyCode(8);
    const data = new User(body);
    data.save();

    // await activityLog(data._id, `created new user ${data.fullName}`)

    activityLog(current_user_id, `added a ${data.role} `)

    return {
      data: data,
      message: "user created",
      status: true,
      statusCode: 201,
    };
  }
}

async function getUsersList(req) {
  let { search } = req.query;
  const { role } = req.body;
  const pageNo = parseInt(req.query.pageNo);
  const pageSize = parseInt(req.query.pageSize);
  const skip = (pageNo - 1) * pageSize;
  const query = {
    deleted: false,
  };
  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const data = await User.find(query).skip(skip).limit(pageSize);
  const count = await User.countDocuments(query)

  return {
    data: data,
    message: `successfully fetched ${role} list`,
    status: true,
    statusCode: 201,
    additionalData: { pageNo, pageSize, count }
  };
}

async function getUserByID(id) {
  const data = await User.findById(id);

  return {
    data: data,
    message: `fetched user detail`,
    status: true,
    statusCode: 201,
  };
}

async function deleteUserService(id, current_user_id) {

  const data = await User.findByIdAndUpdate(id, {    // changed this because earlier there was no checks mantained
    deleted: true
  }, {
    new: true
  });

  if (data?.deleted) {
    CreditScores.deleteMany({
      user: id
    })
  }

  // await activityLog(data._id, `deleted a user ${data.fullName}`);
  activityLog(current_user_id, `deleted a ${data.role} name ${data.fullName} `);
  return {
    data: null,
    message: `deleted user successfully`,
    status: true,
    statusCode: 201,
  };


}

async function searchUsersService(text, role) {
  const regex = new RegExp(text, "ig");
  const data = await User.aggregate([
    {
      $match: {
        role: role,
        $or: [
          { fullName: regex },
          { email: regex },
          { phone: regex }
        ],
        deleted: false
      },
    },
  ]);

  return {
    data: data,
    message: `search results`,
    status: true,
    statusCode: 201,
  };

}

async function changeStatus(id) {
  const data = await User.findById(id);

  data.status = !data.status;
  await data.save()

  return {
    data: data,
    message: `user is ${data.status ? "enabled" : "disabled"}`,
    status: true,
    statusCode: 201,
  };
}

async function isUserAddedBankAccounts(user_id) {
  const res_obj = {
    stripe: false,
    local: false
  }
  const get_connected_account = await ConnectedAccounts.findOne({
    user_id: user_id,
    isDeleted: false
  });
  if (get_connected_account) {
    res_obj.stripe = true;
  }

  const get_account = await BankAccounts.findOne({
    user_id: user_id,
    isDeleted: false
  });

  if (get_account) {
    res_obj.local = true;
  }

  return res_obj;

}

export { addUserByAdmin, getUsersList, getUserByID, deleteUserService, searchUsersService, changeStatus, isUserAddedBankAccounts };
