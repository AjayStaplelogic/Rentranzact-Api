import { User } from "../models/User.mjs";
import { loginUser , addUser } from "../validations/user.mjs";
import { validator } from "../helpers/schema-validator.mjs";

async function login(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, loginUser);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    res.status(200).json({ message: "successfull" });
  }
}

async function signup(req, res) {
  const { body } = req;

  const { isError, errors } = validator(body, addUser);

  if (isError) {
    res.status(403).json({ error: errors });
  } else {
    res.status(200).json({ message: "successfull" });
  }
}

export { login , signup };
