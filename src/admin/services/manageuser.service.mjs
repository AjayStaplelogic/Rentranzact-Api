import { Property } from "../../user/models/property.model.mjs";
import { UserRoles } from "../../user/enums/role.enums.mjs";
import { User } from "../../user/models/user.model.mjs";
import pkg from "bcrypt";

async function addUserByAdmin(body) {

  let { password, role, email } = body;

  const isUser = await User.exists({ role: role, email: email })

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



    const data = new User(body);
    data.save();

    return {
      data: data,
      message: "user created",
      status: true,
      statusCode: 201,
    };
  }

}



async function getUsersList(body, pageNo , pageSize) {
  const { role } = body;
  const skip = (pageNo - 1) * pageSize;



  const data = await User.find({ role: role }).skip(skip).limit(pageSize);


  const count = await User.countDocuments({
    role: role
  })


  return {
    data: data,
    message: `successfully fetched ${role} list`,
    status: true,
    statusCode: 201,
    additionalData : {pageNo , pageSize , count }
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


async function deleteUserService(id) {

  const data = await User.findByIdAndDelete(id);

  return {
    data: data,
    message: `deleted user successfully`,
    status: true,
    statusCode: 201,
  };


}


async function searchUsersService(text) {


  const regex = new RegExp(text, "ig");

   const data = await User.aggregate([
    {
      $match: {
        role : UserRoles.RENTER,
        $or: [
          { fullName: regex },
          { email: regex },
          { phone: regex }
        ],
      },
    },
   ])
 
  return {
    data: data,
    message: `search results`,
    status: true,
    statusCode: 201,
  };

}

export { addUserByAdmin, getUsersList, getUserByID, deleteUserService , searchUsersService };
