// user.service.mjs
import { User } from "../models/user.model.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import { Referral } from "../models/referrals.model.mjs";
import pkg from "bcrypt";

async function loginUser(body) {
  // Add logic to validate user login


  const {email , password} = body;


  const user = await User.findOne({email : email});

  const isPasswordValid = await new Promise((resolve, reject) => {
    pkg.compare(password, user.password , function (err, hash) {
      if (err) {
        console.log(err)
        reject(err); // Reject promise if hashing fails
      } else {
        console.log(hash)
        resolve(hash); // Resolve promise with hashed password
      }
    });
  });

  if(isPasswordValid) {
    const accessToken = await accessTokenGenerator(body);
  return {accessToken : accessToken};
  } else {
    return {message : "password is incorrect"}
  }


  
}

async function addUser(body) {
  // Add logic to create a new user
  const referralCode = generateReferralCode();

  body.referralCode = referralCode;

  let { password } = body;

  const salt = parseInt(process.env.SALT);

  const hashedPassword = await new Promise((resolve, reject) => {
    pkg.hash(password, salt, function (err, hash) {
      if (err) {
        reject(err); // Reject promise if hashing fails
      } else {
        resolve(hash); // Resolve promise with hashed password
      }
    });
  });
  
  // Update body with hashed password
  body.password = hashedPassword;
  



  console.log(body,"---- hashed ")

  const saveInReferral = new Referral({ code: referralCode });

  await saveInReferral.save();

  const user = new User(body);

  await user.save();

  // console.log(user,"-userrrr")
  return user;
}

async function validateCode(code) {
  const validOrNot = await User.findOne({ referralCode: code });

  return Boolean(validOrNot);
}

async function applyReferralCode(code, userID) {
  const applyReferral = await Referral.findOneAndUpdate(
    { code: code },
    { $push: { appliedOn: { userId: userID } } },
    { new: true }
  );

  console.log(applyReferral);
  return Boolean(applyReferral);
}

export { loginUser, addUser, validateCode, applyReferralCode };
