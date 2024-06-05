import { User } from "../models/User.mjs";

import { validator } from "../helpers/schema-validator.mjs";

async function login(req, res) {
  const { isError, errors } = validator(req.body, add);
  res.status(200).json({ message: "successfull" });
}

export { login };
