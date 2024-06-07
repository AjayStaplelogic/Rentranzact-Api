import { signup_User, login_User } from "../validations/user.validation.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import { loginUser, addUser } from "../services/user.service.mjs";

async function login(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, login_User);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    const data = await loginUser(body);
    res.status(200).json(data);
  }
}

async function signup(req, res) {
  const { body } = req;
  const { isError, errors } = validator(body, signup_User);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    const data = await addUser(body);
    res.status(200).json({ message: "successfull" });
  }
}

export { login, signup };
