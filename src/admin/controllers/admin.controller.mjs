// import { userSignup, userLogin, userVerify, socialAuth } from "../validations/user.validation.mjs";
// import { validator } from "../helpers/schema-validator.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addAdmin , loginAdmin
} from "../services/admin.service.mjs";



async function login(req, res) {
  const { body } = req;

//   const { isError, errors } = validator(body, userLogin);

//   if (isError) {
//     sendResponse(res, [], errors, false, 403);
//   } else {
    const data = await loginAdmin(body);

    sendResponse(
      res,
      data.data,
      data.message,
      data.status,
      data.statusCode,
      data.accessToken
    );
  }






  async function signup(req, res) {
    const { body } = req;


    const data = await addAdmin(body);
  
        sendResponse(
          res,
          { id: data?.data?._id, otp: data?.data?.otp },
          data.message,
          data.status,
          data.statusCode
        );
  
   
    }
  
  










































// }

// async function signup(req, res) {
//   const { body } = req;
//   const { referralCode } = body;

//   const { isError, errors } = validator(body, userSignup);

//   if (isError) {
//     sendResponse(res, [], errors, false, 403);
//   } else {
//     if (referralCode) {
//       const validCode = await validateCode(referralCode);
//       if (validCode) {
//         const data = await addUser(body);

//         await applyReferralCode(referralCode, data._id);

//         sendResponse(
//           res,
//           data.data,
//           data.message,
//           data.status,
//           data.statusCode,
//           data.accessToken
//         );
//       } else {
//         res.status(400).json({ msg: "Invalid Referral code" });
//       }
//     } else {
//       const data = await addUser(body);

//       sendResponse(
//         res,
//         { id: data?.data?._id, otp: data?.data?.otp },
//         data.message,
//         data.status,
//         data.statusCode
//       );
//     }
//   }
// }

// async function userVerification(req, res) {
//   const { body } = req;


//   // const { isError, errors } = validator(body, userVerify);

//   // if (isError) {
//   //   sendResponse(res, [], errors, false, 403);
//   // } else {

//     const data = await verifyOtp(body);

//     sendResponse(
//       res,
//       data.data,
//       data.message,
//       data.status,
//       data.statusCode,
//       data?.accessToken
//     );
//   }

// // }

// async function socialLogin(req, res) {
//   const { body } = req;

//   // const { isError, errors } = validator(body, socialAuth)

//   // if (isError) {
//   //   sendResponse(res, [], errors, false, 403);
//   // } else {
//     const data = await socialSignup(body);

//     sendResponse(
//       res,
//       data.data,
//       data.message,
//       data.status,
//       data.statusCode,
//       data.accessToken
//     );
//   }


// async function myprofile(req, res) {
//   console.log(req.user.data,  "====user")
//   const { _id, role } = req.user.data;
//   const data = await myProfileDetails(_id, role);
//   sendResponse(
//     res,
//     data.data,
//     data.message,
//     data.status,
//     data.statusCode
//   );
// }


// }

export { login, signup };
