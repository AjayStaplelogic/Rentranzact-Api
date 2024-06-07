// user.service.mjs
import { User } from "../models/user.model.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";

async function loginUser(body) {
  // Add logic to validate user login
  const accessToken = await accessTokenGenerator(body);
  return accessToken;
}

async function addUser(body) {
  // Add logic to create a new user
  const newUser = new User(body);
  await newUser.save();
  return newUser;
}

export { loginUser, addUser };
