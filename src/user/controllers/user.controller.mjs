import { userSignup, userLogin, userVerify, socialAuth } from "../validations/user.validation.mjs";
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


async function login(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, userLogin);

  if (isError) {
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
    if (referralCode) {
      const validCode = await validateCode(referralCode);
      if (validCode) {
        const data = await addUser(body);

        await applyReferralCode(referralCode, data._id);

        sendResponse(
          res,
          data.data,
          data.message,
          data.status,
          data.statusCode,
          data.accessToken
        );
      } else {
        res.status(400).json({ msg: "Invalid Referral code" });
      }
    } else {
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

  const data = await favouritesProperties(id);

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
  console.log(req.user.data, "====user")
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
    console.log(error, '======errir')
    return sendResponse(res, {}, `${error}`, false, 500);
  }

}


export { deleteAggrement, wallet, login, signup, userVerification, socialLogin, myprofile, forgotPassword, favourites, uploadLeaseAggrement, getLeaseAggrements, userOtpVerification, resetPassword };
