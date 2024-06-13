import { User } from "../models/user.model.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import { Referral } from "../models/referrals.model.mjs";
import pkg from "bcrypt";
import { sendMail } from "../helpers/sendMail.mjs";
import { html } from "../helpers/emailTemplate.mjs";
import { OAuth2Client } from "google-auth-library";
import moment from "moment";
import { UserRoles } from "../enums/role.enums.mjs";
const client = new OAuth2Client();

async function loginUser(body) {
  const { email, password } = body;

  const user = await User.findOne({ email: email });

  if (user) {
    const isPasswordValid = await new Promise((resolve, reject) => {
      pkg.compare(password, user.password, function (err, hash) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    if (isPasswordValid) {
      if (user.verified) {
        const accessToken = await accessTokenGenerator(user);
        return {
          data: user,
          message: "logged in successfully",
          status: true,
          statusCode: 200,
          accessToken: accessToken,
        };
      } else {
        return {
          data: [],
          message: "please verify email id",
          status: true,
          statusCode: 401,
        };
      }
    } else {
      return {
        data: [],
        message: "password is incorrect",
        status: false,
        statusCode: 401,
      };
    }
  } else {
    return {
      data: [],
      message: "user not found",
      status: false,
      statusCode: 404,
    };
  }
}

async function addUser(body) {
  const userExist = await User.findOne({ email: body.email });

  if (userExist) {
    return {
      data: [],
      message: "email already exist ",
      status: false,
      statusCode: 409,
    };
  }

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

  const saveInReferral = new Referral({ code: referralCode });

  await saveInReferral.save();

  const user = new User(body);

  await user.save();

  const htmlTemplate = html(user.otp);

  sendMail(body.email, "OTP Verification", htmlTemplate);

  return {
    data: user,
    message: "signup successfully. please verify otp",
    status: true,
    statusCode: 201,
  };
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
  return Boolean(applyReferral);
}

async function verifyOtp(body) {
  const { otp, id } = body;

  const user = await User.findById(id);

  if (user?.otp === otp) {
    const user_ = await User.findByIdAndUpdate({ _id: id }, { verified: true });

    console.log(user_, "userrr");

    return {
      data: user_,
      message: "otp verified successfully",
      status: true,
      statusCode: 200,
      accessToken: await accessTokenGenerator(user),
    };
  } else {
    return {
      data: [],
      message: "incorrect otp",
      status: false,
      statusCode: 400,
    };
  }
}

/*

{
    "userID": "288765820781840",
    "expiresIn": 5183,
    "accessToken": "EAAPZAiGlW9wwBO2EOU2hocXPSPpV0moGITvEGKtutP46fkO7NRZBFx2Rt98xsyuhOcFxumM7QqU9OkaFrgPS9ZCK1nxAbdZCa3VG9ZBu5ZBZAZAym9HsBZAPe0FcE8AqrD0wN0A9LuyZClbVLJSEocyOZBYGSQz8xX8mmNWez278JYEIZBQZAV7Y6crLGvhOtOVEYkZC2ne2bTr6VlPldqzPkVyJN4OrGmoAZDZD",
    "signedRequest": "QbGg92IllGkUiF7IRQ7AkGWCqhMqMwhc3CqjKyPbKCQ.eyJ1c2VyX2lkIjoiMjg4NzY1ODIwNzgxODQwIiwiY29kZSI6IkFRQTk2UmoybnZLbVZIRWJzQlJlb1VqNFA1V3FxVjFfMEpXOTdnd2dwcnI0VnN5dDQ5VzBZV2RJN0VPc0d5VENlUjRRQjZCb29jU1EyZjhsUWMyclFBTHByWWZPMmh4R2pJYjlYdGVXdktyQkU5RnRBcTB5MHYzNlpUR3hFTTBMT3NfdUFkNjJNRlFrR1ZqczNCRlA0TzNHYW5XRkVoRFNvY1ZmSkJyRnVEemRFemhFUjRFUjNkYVdpNGZ5X3gxdGdiUjF6V3VSN3RLb1B4ZHljbmo1U2pxU0l3eDZxUWhIZUN3MDZod2NMa043SERoZ0daWjhSRlJCdGo4TWpuQ0huVHZURTN1YmhfUTR1RWZLX0MzWG0tWi1UUFpGbmZaS2QxMVBYa0J0MzJfTUVZOTlGYVBvb0JVSVd6UDNYVmdkVTZ0MEVBSWY1Zkxjc3luVk5MWi1Kd2NDIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE3MTgyNjQwMTd9",
    "graphDomain": "facebook",
    "grantedScopes": "email,openid,public_profile",
    "data_access_expiration_time": 1726040017,
    "id": "288765820781840",
    "first_name": "Anuj",
    "last_name": "Kumar",
    "name": "Anuj Kumar",
    "name_format": "{first} {last}",
    "picture": {
        "data": {
            "height": 50,
            "is_silhouette": false,
            "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=288765820781840&height=50&width=50&ext=1720856018&hash=AbaK9qzCXliH2G9OvQE8pUQU",
            "width": 50
        }
    },
    "short_name": "Anuj",
    "email": "fullstackdeveloper710@gmail.com",
    "socialPlatform": "facebook"
}







*/

async function socialSignup(body) {
  const { socialPlatform, email, email_verified, name, picture, exp } = body;

  if (socialPlatform === "google") {
    const timestampMoment = moment.unix(exp);

    const currentMoment = moment();

    if (timestampMoment.isBefore(currentMoment)) {
      //token hase expired

      return {
        data: [],
        message: "token expired try again",
        status: false,
        statusCode: 401,
      };
    } else {
      //token is not expired

      const user = await User.findOne({
        email: email,
        socialPlatform: socialPlatform,
      });

      console.log(user, "0-----user");

      if (user) {
        return {
          data: user,
          message: "login successfully",
          status: true,
          statusCode: 200,
          accessToken: await accessTokenGenerator(user),
        };
      } else {
        const userPayload = {
          email: email,
          role: UserRoles.RENTER,
          fullName: name,
          verified: email_verified,
          picture: picture,
          socialPlatform: socialPlatform,
        };

        const newUser = new User(userPayload);
        newUser.save();

        return {
          data: newUser,
          message: "login successfully",
          status: true,
          statusCode: 200,
          accessToken: await accessTokenGenerator(newUser),
        };
      }
    }

    /*
    
    {
  "iss": "https://accounts.google.com",
  "azp": "821353603223-d3vutqm04fu88jl0jmju9ts19a5kp290.apps.googleusercontent.com",
  "aud": "821353603223-d3vutqm04fu88jl0jmju9ts19a5kp290.apps.googleusercontent.com",
  "sub": "114876961546421729869",
  "email": "kkanujkumar081@gmail.com",
  "email_verified": true,
  "nbf": 1718259806,
  "name": "Anuj Kumar",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocJfwfBVixj9Olrk0-EbcgbYjrgmBSqW5NNIix9eKpBeuP8QMA=s96-c",
  "given_name": "Anuj",
  "family_name": "Kumar",
  "iat": 1718260106,
  "exp": 1718263706,
  "jti": "18869c82f9dbb860e0f0e063a5c07bad37173173"
}
    
    
    
    */

    // const { email, name, picture, email_verified } = user;
  } else if (socialPlatform === "facebook") {
    const { expiresIn } = body;

    const currentMoment = moment();

    const expiresTimeStamp = currentMoment + expiresIn;

    const timestampMoment = moment.unix(expiresTimeStamp);

    if (timestampMoment.isBefore(currentMoment)) {
      //token hase expired

      return {
        data: [],
        message: "token expired try again",
        status: false,
        statusCode: 401,
      };
    } else {
      //token is not expired

      const user = await User.findOne({
        email: email,
        socialPlatform: socialPlatform,
      });

      console.log(user, "0-----user");

      if (user) {
        return {
          data: user,
          message: "login successfully",
          status: true,
          statusCode: 200,
          accessToken: await accessTokenGenerator(user),
        };
      } else {
        const userPayload = {
          email: email,
          role: UserRoles.RENTER,
          fullName: name,
          verified: email_verified,
          picture: picture?.data?.url,
          socialPlatform: socialPlatform,
        };

        const newUser = new User(userPayload);
        newUser.save();

        return {
          data: newUser,
          message: "login successfully",
          status: true,
          statusCode: 200,
          accessToken: await accessTokenGenerator(newUser),
        };
      }
    }
  } else {
    console.log("login with apple");
  }

  // const ticket = await client.verifyIdToken({
  //   idToken: credential,
  //   audience: client_id,
  // });
  // const payload = ticket.getPayload();
  // const userid = payload["sub"];
}

export {
  loginUser,
  addUser,
  validateCode,
  applyReferralCode,
  verifyOtp,
  socialSignup,
};
