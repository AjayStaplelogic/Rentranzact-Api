import { User } from "../models/user.model.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import { Referral } from "../models/referrals.model.mjs";
import pkg from "bcrypt";
import { sendMail } from "../helpers/sendMail.mjs";
import { html } from "../helpers/emailTemplate.mjs";
import moment from "moment";
import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import crypto from 'crypto';
import appleSigninAuth from 'apple-signin-auth';
import { LeaseAggrements } from "../models/leaseAggrements.model.mjs";
import { Wallet } from "../models/wallet.model.mjs";
import fs from "fs";
import path from "path";
import { dirname } from 'path';




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

async function myProfileDetails(id, role) {

  const data = await User.findOne({
    _id: id,
    role: role
  });


  let data_ = data.toObject();

  return {
    data: data_,
    message: "fetched user details successfully",
    status: true,
    statusCode: 200
  };

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
  } else if (socialPlatform === "facebook") {
    const { expiresIn } = body;

    const currentMoment = moment();

    const expiresTimeStamp = currentMoment + expiresIn;

    const timestampMoment = moment.unix(expiresTimeStamp);

    if (timestampMoment.isBefore(currentMoment)) {
      return {
        data: [],
        message: "token expired try again",
        status: false,
        statusCode: 401,
      };
    } else {
      const user = await User.findOne({
        email: email,
        socialPlatform: socialPlatform,
      });

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

    const { id_token, nonce, email, socialPlatform, name } = body;

    const appleIdTokenClaims = await appleSigninAuth.verifyIdToken(id_token, {
      /** sha256 hex hash of raw nonce */
      nonce: nonce ? crypto.createHash('sha256').update(nonce).digest('hex') : undefined,
    });

    const { exp, email_verified } = appleIdTokenClaims;

    const currentMoment = moment();

    const expiresTimeStamp = currentMoment + exp;

    const timestampMoment = moment.unix(expiresTimeStamp);

    if (timestampMoment.isBefore(currentMoment)) {
      return {
        data: [],
        message: "token expired try again",
        status: false,
        statusCode: 401,
      };
    } else {
      const user = await User.findOne({
        email: email,
        socialPlatform: socialPlatform,
      });

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

    // appleIDtokencliams 
    // {
    //   iss: 'https://appleid.apple.com',
    //   aud: 'com.rentranzact.mobile',
    //   exp: 1721717184,
    //   iat: 1721630784,
    //   sub: '000146.68dacf49d0e946a99a8e02cf784efa7b.1818',
    //   nonce: '1e4918cb32db603039286f280b06f1dd907f6f2b226dfa225f94373f0000935f',
    //   c_hash: '8UUiOGEdhcAi83JevY4AfQ',
    //   email: 'staplers.staplelogic@gmail.com',
    //   email_verified: true,
    //   auth_time: 1721630784,
    //   nonce_supported: true
    // } 


  }
}

async function forgotPasswordService(email) {

  const user = await User.findOne({ email: email });

  if (user.verified) {
    const htmlTemplate = "<h1>Change password</h1>"

    const resendOTP = sendMail(email, "OTP Verification", htmlTemplate);

  }

  // if (user?.otp === otp) {

  //   const user_ = await User.findByIdAndUpdate({ _id: id }, { verified: true });

  //   return {
  //     data: user_,
  //     message: "otp verified successfully",
  //     status: true,
  //     statusCode: 200,
  //     accessToken: await accessTokenGenerator(user),
  //   };
  // } else {
  //   return {
  //     data: [],
  //     message: "incorrect otp",
  //     status: false,
  //     statusCode: 400,
  //   };
  // }






}

async function favouritesProperties(id) {

  const { favorite } = await User.findById(id).select("favorite")
  const data = await Property.aggregate([
    {
      $match: {
        _id: { $in: favorite }
      }
    }])

  return {
    data: data,
    message: "successfully fetched favorite properties",
    status: true,
    statusCode: 200
  };

}

async function uploadLeaseAggrementService(propertyID, userID, role, dataUrl) {
  if (role === UserRoles.RENTER) {
    const { landlord_id, propertyName } = await Property.findById(propertyID);

    const data = new LeaseAggrements({
      propertyName: propertyName,
      propertyID: propertyID,
      renterID: userID,
      uploadedAt: Date.now(),
      url: dataUrl,
      landlordID: landlord_id,
      uploadedBy: role
    })

    data.save();


    return {
      data: data,
      message: "successfully uploaded lease aggrement",
      status: true,
      statusCode: 200
    };

  } else if (role === UserRoles.LANDLORD) {


    const { renterID, propertyName } = await Property.findById(propertyID);

    const data = new LeaseAggrements({
      propertyName: propertyName,
      propertyID: propertyID,
      renterID: renterID,
      uploadedAt: Date.now(),
      url: dataUrl,
      landlordID: userID,
      uploadedBy: role
    })

    data.save();


    return {
      data: data,
      message: "submitted lease aggrement successfully",
      status: true,
      statusCode: 201
    };



  }


}

async function getLeaseAggrementList(id, role) {



  if (role === UserRoles.RENTER) {

    const data = await LeaseAggrements.find({ renterID: id })
    return {
      data: data,
      message: "successfully fetched lease aggrements",
      status: true,
      statusCode: 200
    };
  } else if (role === UserRoles.LANDLORD) {

    const data = await LeaseAggrements.find({ landlordID: id })
    return {
      data: data,
      message: "successfully fetched lease aggrements",
      status: true,
      statusCode: 200
    };
  }
}

async function getWalletDetails(id) {


  const { walletPoints } = await User.findById(id);

  const results = await Wallet.aggregate([
    { $match: { userID: id } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  console.log(results, "==-=-=-=-=-resultsss")


  const Deposited = results.find(result => result._id === 'CREDIT')?.totalAmount || 0;
  const Withdrawn = results.find(result => result._id === 'DEBIT')?.totalAmount || 0;



  return {
    data: {
      walletPoints,
      Deposited,
      Withdrawn
    },
    message: "successfully fetched lease aggrements",
    status: true,
    statusCode: 200
  };

}


async function deleteAggrementByID(userID, aggrementID, role) {

  if (role === UserRoles.RENTER) {
    const data = await LeaseAggrements.findByIdAndDelete(aggrementID)
    const regex = /\/([^\/?#]+)\.[^\/?#]+$/;

    console.log(data, "===data aaaaaaa")
    const match = data.url.match(regex);

    if (match) {
      const filenameWithExtension = match[1];
      const filePath = path.join(__dirname, "../", "uploads", "LeaseAggrements", `${data.renterID}.pdf`)

      console.log(filePath , "=====pathid ")
      fs.unlinkSync(filePath)
      console.log(filenameWithExtension);
    } else {
      console.log('Filename not found in URL');
    }

    return {
      data,
      message: "successfully fetched lease aggrements",
      status: true,
      statusCode: 200
    };

  } else if (role === UserRoles.LANDLORD) {



  }




}

export {
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
  deleteAggrementByID
};
