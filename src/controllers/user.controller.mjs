import { signup_User, login_User } from "../validations/user.validation.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import {
  loginUser,
  addUser,
  validateCode,
  applyReferralCode,
} from "../services/user.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";

async function login(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, login_User);

  if (isError) {
    sendResponse(res, [], errors, false, 403);
  } else {
    const data = await loginUser(body);

    sendResponse(
      res,
      [],
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

  const { isError, errors } = validator(body, signup_User);

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
      res.status(200).json(data);
    }
  }
}

export { login, signup };
