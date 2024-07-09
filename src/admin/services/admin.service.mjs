// import { User } from "../models/user.model.mjs";
// import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
// import { Referral } from "../models/referrals.model.mjs";
import pkg from "bcrypt";
// import { sendMail } from "../helpers/sendMail.mjs";
// import { html } from "../helpers/emailTemplate.mjs";
// import { OAuth2Client } from "google-auth-library";
// import moment from "moment";
// import { UserRoles } from "../enums/role.enums.mjs";
import { Admin } from "../models/admin.model.mjs";


async function loginAdmin(body) {
  const { email, password } = body;

  const admin = await Admin.findOne({ email: email });

  if (admin) {
    const isPasswordValid = await new Promise((resolve, reject) => {
      pkg.compare(password, admin.password, function (err, hash) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    if (isPasswordValid) {
      if (admin.verified) {

        const adminData = await Admin.aggregate([
          {
            $match: {
              email: email
            }
          },
          {
            $lookup: {
              from: "roles",
              localField: "role",
              foreignField: "name",
              as: "permissions",
            }
          },
          {
            $project: {
              // Project all fields from the Admin collection
              // Include other fields from Admin as needed
              _id: 1, // Exclude the default MongoDB _id field
              email: 1, // Include the email field from the Admin collection
              role: 1, // Include other fields from Admin collection
              fullName: 1, // Include other fields from Admin collection
              status : 1,
              verified : 1,
              picture : 1,
              createdAt : 1, 
              updatedAt : 1,
              // Project the permissions array with selected fields
              permissions: {
                $map: {
                  input: "$permissions",
                  as: "perm",
                  in: {
                    permissions: "$$perm.permissions"
                  }
                }
              }
            }
          }
        ])

        
        const accessToken = await accessTokenGenerator(admin);
        return {
          data: adminData,
          message: "logged in successfully",
          status: true,
          statusCode: 200,
          accessToken: accessToken,
        };
      } else {
        return {
          data: [],
          message: "please verify email id",
          status: true,
          statusCode: 401,
        };
      }
    } else {
      return {
        data: [],
        message: "password is incorrect",
        status: false,
        statusCode: 401,
      };
    }
  } else {
    return {
      data: [],
      message: "admin not found",
      status: false,
      statusCode: 404,
    };
  }
}

async function addAdmin(body) {
  const adminExist = await Admin.findOne({ email: body.email });

  if (adminExist) {
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
    message: "signup successfully",
    status: true,
    statusCode: 201,
  };
}

// async function validateCode(code) {
//   const validOrNot = await User.findOne({ referralCode: code });
//   return Boolean(validOrNot);
// }


// async function myProfileDetails(id, role) {

//   const data = await User.find({
//     _id: id,
//     role : role
//   })

//   return {
//     data: data,
//     message: "fetched user details successfully",
//     status: true,
//     statusCode: 200
//   };

// }

// async function applyReferralCode(code, userID) {
//   const applyReferral = await Referral.findOneAndUpdate(
//     { code: code },
//     { $push: { appliedOn: { userId: userID } } },
//     { new: true }
//   );
//   return Boolean(applyReferral);
// }

// async function verifyOtp(body) {
//   const { otp, id } = body;

//   const user = await User.findById(id);

//   if (user?.otp === otp) {

//     const user_ = await User.findByIdAndUpdate({ _id: id }, { verified: true });

//     return {
//       data: user_,
//       message: "otp verified successfully",
//       status: true,
//       statusCode: 200,
//       accessToken: await accessTokenGenerator(user),
//     };
//   } else {
//     return {
//       data: [],
//       message: "incorrect otp",
//       status: false,
//       statusCode: 400,
//     };
//   }
// }

// async function socialSignup(body) {

//   const { socialPlatform, email, email_verified, name, picture, exp } = body;




//   if (socialPlatform === "google") {
//     const timestampMoment = moment.unix(exp);

//     const currentMoment = moment();

//     if (timestampMoment.isBefore(currentMoment)) {
//       //token hase expired

//       return {
//         data: [],
//         message: "token expired try again",
//         status: false,
//         statusCode: 401,
//       };
//     } else {
//       //token is not expired

//       const user = await User.findOne({
//         email: email,
//         socialPlatform: socialPlatform,
//       });

//       console.log(user, "0-----user");

//       if (user) {
//         return {
//           data: user,
//           message: "login successfully",
//           status: true,
//           statusCode: 200,
//           accessToken: await accessTokenGenerator(user),
//         };
//       } else {
//         const userPayload = {
//           email: email,
//           role: UserRoles.RENTER,
//           fullName: name,
//           verified: email_verified,
//           picture: picture,
//           socialPlatform: socialPlatform,
//         };

//         const newUser = new User(userPayload);
//         newUser.save();

//         return {
//           data: newUser,
//           message: "login successfully",
//           status: true,
//           statusCode: 200,
//           accessToken: await accessTokenGenerator(newUser),
//         };
//       }
//     }
//   } else if (socialPlatform === "facebook") {
//     const { expiresIn } = body;

//     const currentMoment = moment();

//     const expiresTimeStamp = currentMoment + expiresIn;

//     const timestampMoment = moment.unix(expiresTimeStamp);

//     if (timestampMoment.isBefore(currentMoment)) {
//       return {
//         data: [],
//         message: "token expired try again",
//         status: false,
//         statusCode: 401,
//       };
//     } else {
//       const user = await User.findOne({
//         email: email,
//         socialPlatform: socialPlatform,
//       });

//       if (user) {
//         return {
//           data: user,
//           message: "login successfully",
//           status: true,
//           statusCode: 200,
//           accessToken: await accessTokenGenerator(user),
//         };
//       } else {
//         const userPayload = {
//           email: email,
//           role: UserRoles.RENTER,
//           fullName: name,
//           verified: email_verified,
//           picture: picture?.data?.url,
//           socialPlatform: socialPlatform,
//         };

//         const newUser = new User(userPayload);
//         newUser.save();

//         return {
//           data: newUser,
//           message: "login successfully",
//           status: true,
//           statusCode: 200,
//           accessToken: await accessTokenGenerator(newUser),
//         };
//       }
//     }
//   } else {
//     console.log("login with apple");
//   }
// }

export {
  loginAdmin,
  addAdmin
};
