import { User } from "../models/User.mjs";
import { loginUser, addUser } from "../validations/user.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";

async function login(req, res) {
  const { body } = req;
  console.log('userrrrr', req?.user)

  const accessToken = await accessTokenGenerator(body);

  console.log(accessToken);

  const { isError, errors } = validator(body, loginUser);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    res.status(200).json({ message: "successfull", accessToken: accessToken });
  }
}

async function signup(req, res) {
  const { body } = req;

  console.log(generateReferralCode());

  const { isError, errors } = validator(body, addUser);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    res.status(200).json({ message: "successfull" });
  }
}

export { login, signup };
