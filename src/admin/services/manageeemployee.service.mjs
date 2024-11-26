import activityLog from "../helpers/activityLog.mjs";
import { Admin } from "../models/admin.model.mjs";
import pkg from "bcrypt";

async function getEmployeeService(pageNo, pageSize, req) {

  let { search, role } = req.query;
  let query = {
    role: { $ne: "superAdmin" },
    isDeleted: false
  };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
  }

  if (role) { query.role = role };
  const skip = (pageNo - 1) * pageSize;
  const data = await Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize);

  const count = await Admin.countDocuments(query);


  return {
    data: data,
    message: `successfully fetched employee list`,
    status: true,
    statusCode: 200,
    additionalData: { pageNo, pageSize, count }

  };
}

async function addEmployeeService(body) {

  const userExist = await Admin.findOne({ email: body.email.toLowerCase(), isDeleted  : false });

  if (userExist) {
    return {
      data: [],
      message: "email already exist ",
      status: false,
      statusCode: 409,
    };
  }

  let { password } = body;

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
  body.joining_date = new Date();
  const admin = new Admin(body);

  await admin.save();

  await activityLog(admin._id, `created new employee ${admin.fullName}`)

  return {
    data: admin,
    message: "admin created successfully.",
    statusCode: 201,
  };

  return {
    data: data,
    message: `successfully fetched employee list`,
    status: true,
    statusCode: 201,
  };
}

export {
  getEmployeeService,
  addEmployeeService
}