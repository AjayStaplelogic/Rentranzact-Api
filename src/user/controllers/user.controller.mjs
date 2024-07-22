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
  uploadLeaseAggrementService
} from "../services/user.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";


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

async function favourites(req , res) {

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

  const { email } = req.user.data;

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

  const propertyID = req.propertyID;
  const userID = req.user.data._id;
  const role = req.user.data.role;
  const dataUrl = req.documents;
  const data = await uploadLeaseAggrementService(propertyID,userID, role, dataUrl);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}


export { login, signup, userVerification, socialLogin, myprofile, forgotPassword , favourites  , uploadLeaseAggrement};
