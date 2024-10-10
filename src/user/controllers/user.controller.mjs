import { userSignup, userLogin, userVerify, socialAuth, switchRoleValidation, shareReferralCodeValidation } from "../validations/user.validation.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import {
  loginUser,
  addUser,
  validateCode,
  applyReferralCode,
  verifyOtp,
  socialSignup,
  myProfileDetails,
  forgotPasswordService,
  favouritesProperties,
  uploadLeaseAggrementService,
  getLeaseAggrementList,
  getWalletDetails,
  deleteAggrementByID,
  verifyUserOtp
} from "../services/user.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { User } from '../models/user.model.mjs'
import { Tokens } from '../models/tokens.model.mjs'
import moment from 'moment';
import * as bcrypt from "bcrypt";
import { Property } from "../models/property.model.mjs";
import { Maintenance } from "../models/maintenance.model.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import * as referralService from "../services/referral.service.mjs";
import { EShareVia } from "../enums/referral.enum.mjs";
import * as referralEmailService from "../emails/referral.emails.mjs"

async function deleteUser(req, res) {

  try {
    const id = req.user.data._id;
    console.log(id, "===id")
    const data = User.findByIdAndUpdate(id, { deleted: true }).then((Res) => console.log(Res))
    return sendResponse(res, {}, 'successfully deleted data', true, 200)

  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }

}

async function login(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, userLogin);

  if (false) {
    sendResponse(res, [], errors, false, 403);
  } else {
    const data = await loginUser(body);

    sendResponse(
      res,
      data.data,
      data.message,
      data.status,
      data.statusCode,
      data.accessToken
    );
  }
}

async function signup(req, res) {
  const { body } = req;
  const { referralCode } = body;

  const { isError, errors } = validator(body, userSignup);

  if (isError) {
    sendResponse(res, [], errors, false, 403);
  } else {
    body.initial_role = body.role;

    if (referralCode) {
      // const validCode = await validateCode(referralCode);
      const validCode = referralService.isMyCodeExistsInUsers(referralCode);
      if (!validCode) {
        // const data = await addUser(body);

        // await applyReferralCode(referralCode, data._id);

        // sendResponse(
        //   res,
        //   data.data,
        //   data.message,
        //   data.status,
        //   data.statusCode,
        //   data.accessToken
        // );
        res.status(400).json({ msg: "Invalid Referral code" });
      }
    }

    const data = await addUser(body);

    sendResponse(
      res,
      { id: data?.data?._id, otp: data?.data?.otp },
      data.message,
      data.status,
      data.statusCode
    );
  }
}

async function userVerification(req, res) {
  const { body } = req;

  const data = await verifyOtp(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data?.accessToken
  );
}

async function favourites(req, res) {

  const id = req.user.data._id;

  const data = await favouritesProperties(id, req);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );

}

async function socialLogin(req, res) {
  const { body } = req;

  const data = await socialSignup(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function myprofile(req, res) {
  // console.log(req.user.data, "====user")
  const { _id, role } = req.user.data;
  const data = await myProfileDetails(_id, role);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function forgotPassword(req, res) {

  const { email } = req.body;

  const data = await forgotPasswordService(email);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function uploadLeaseAggrement(req, res) {
  const role = req.user.data.role;
  const propertyID = req.body.propertyID;

  const userID = req.user.data._id;

  const dataUrl = req.documents;
  const data = await uploadLeaseAggrementService(propertyID, userID, role, dataUrl);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function getLeaseAggrements(req, res) {

  const { _id, role } = req.user.data;


  const data = await getLeaseAggrementList(_id, role);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function wallet(req, res) {
  const { _id } = req.user.data;


  const data = await getWalletDetails(_id);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function deleteAggrement(req, res) {
  const { _id, role } = req.user.data;
  const { id } = req.params;


  const data = await deleteAggrementByID(_id, id, role);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function userOtpVerification(req, res) {
  let { id, otp } = req.body;
  const data = await verifyUserOtp(id, otp);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function resetPassword(req, res) {
  try {
    let { password } = req.body;
    let get_user = await User.findOne({ _id: req.user.data._id }).lean().exec();
    if (get_user) {
      let hash_password = bcrypt.hashSync(password, Number(process.env.SALT));
      let update_user = await User.findByIdAndUpdate(get_user._id,
        {
          password: hash_password
        }
      );
      return sendResponse(res, {}, "Password reset successfully", true, 200);
    }
    return sendResponse(res, {}, "User not found", false, 404);

  } catch (error) {
    // console.log(error, '======errir')
    return sendResponse(res, {}, `${error}`, false, 500);
  }

}

async function editMyProfile(req, res) {
  try {
    let id = req.user.data._id;
    delete req.body.email;
    delete req.body.password;
    delete req.body.otp;
    delete req.body.role;
    let update_user = await User.findByIdAndUpdate(id,
      req.body,
      { new: true }
    );

    if (update_user) {
      delete update_user.email;
      delete update_user.password;
      delete update_user.otp;
      return sendResponse(res, update_user, "Profile updated successfully", true, 200);

    }

    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    // console.log(error, '======errir')
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function teriminateRenter(req, res) {
  try {

    const propertyID = req.params.id;

    await Property.findByIdAndUpdate(propertyID, {
      rented: false,
      rent_period_end: "",
      rent_period_start: "",
      renterID: null,
      payment_count: 0
    })

    await Maintenance.deleteMany({ propertyID: propertyID });
    return sendResponse(res, [], `terminated successfully`, true, 200);

  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function commisions(req, res) {

  const userID = req.user.data._id;

  const data = await Property.aggregate([
    {
      $match: {
        property_manager_id: userID  // Match the property_manager_id
      }
    },
    {
      $addFields: {
        propertyIDStr: { $toString: "$_id" }  // Convert _id to string for matching
      }
    },
    {
      $lookup: {
        from: "transactions",               // The transactions collection
        let: { propertyIDStr: "$propertyIDStr" }, // Variable for the property ID string
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$propertyID", "$$propertyIDStr"] } // Match propertyID with the propertyIDStr
            }
          },
          {
            $project: {
              _id: 0,                        // Exclude _id from the transactions if not needed
              allCharges: 1,
              date: 1                  // Include allCharges field
            }
          }
        ],
        as: "transactions"                  // Output array field
      }
    },
    {
      $unwind: "$transactions"              // Flatten the transactions array
    },
    {
      $match: {
        "transactions.allCharges.agent_fee": { $exists: true, $ne: null } // Ensure agent_fee is present and not null
      }
    },
    {
      $project: {
        images: 1,
        propertyName: 1,                   // Include propertyName from properties
        address: 1,                        // Include address from properties
        commision: "$transactions.allCharges.agent_fee",// Include agent_fee from transactions
        rent: "$transactions.allCharges.rent",
        date: "$transactions.date"
      }
    }
  ])


  sendResponse(res, data, "commsision list fetched", true, 200);

}

const getUserDetails = async (req, res) => {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "Id is required", false, 400);
    }

    let data = await User.findById(id, {
      password: 0,
      otp: 0,
      kinDetails: 0
    }).lean().exec();

    if (data) {
      return sendResponse(res, data, "User details fetched", true, 200);
    }
    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function switchRole(req, res) {
  try {
    const { isError, errors } = validator(req.body, switchRoleValidation);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }
    const user_id = req?.user?.data?._id;
    let { role } = req.body;

    if (role === req?.user?.data?.role) {
      return sendResponse(res, {}, "You are already on same role", false, 404);
    }

    let update_user = await User.findByIdAndUpdate(user_id,
      {
        role: role
      },
      { new: true }
    );

    if (update_user) {
      const accessToken = await accessTokenGenerator(update_user);
      delete update_user.password;
      delete update_user.otp;
      return sendResponse(res, update_user, "Profile switched successfully", true, 200, accessToken);
    }

    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    // console.log(error, '======errir')
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function shareReferralCode(req, res) {
  try {
    const { isError, errors } = validator(req.body, shareReferralCodeValidation);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    if (req.body.share_via === EShareVia.email) {
      referralEmailService.sendReferralLink({
        email: req.body.share_via,
        referralCode: req?.user?.data?.myCode
      });

      return sendResponse(res, {}, "Success", true, 200, accessToken);
    }
    return sendResponse(res, {}, "Invalid Share Type", false, 400);
  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

export {
  deleteUser,
  teriminateRenter,
  deleteAggrement,
  wallet,
  login,
  signup,
  userVerification,
  socialLogin,
  myprofile,
  forgotPassword,
  favourites,
  uploadLeaseAggrement,
  getLeaseAggrements,
  userOtpVerification,
  resetPassword,
  editMyProfile,
  commisions,
  getUserDetails,
  switchRole,
  shareReferralCode
};
