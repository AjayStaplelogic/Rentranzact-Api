import { Admin } from "../models/admin.model.mjs";
import pkg from "bcrypt";

async function getEmployeeService(pageNo, pageSize) {
 
  const skip = (pageNo - 1) * pageSize;
    const data = await Admin.find({
        role: { $ne: "superAdmin" }
    }).skip(skip).limit(pageSize);

    const count = await Admin.countDocuments({
      role: { $ne: "superAdmin" }
  });
    
  
    return {
      data: data,
      message: `successfully fetched employee list`,
      status: true,
      statusCode: 200,
      additionalData : {pageNo , pageSize , count }
      
    };
  }

  async function addEmployeeService(body) {
 
    const userExist = await Admin.findOne({ email: body.email});

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
    
    const admin = new Admin(body);
  
    await admin.save();
  
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