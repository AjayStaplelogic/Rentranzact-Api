import { Admin } from "../models/admin.model.mjs";

async function getEmployeeService() {
 
    const data = await Admin.find({
        role: { $ne: "superAdmin" }
    });
    
  
    return {
      data: data,
      message: `successfully fetched employee list`,
      status: true,
      statusCode: 201,
    };
  }

  export {
    getEmployeeService
  }