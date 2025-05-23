import { User } from "../models/user.model.mjs";
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
import { generateOTP } from '../helpers/otpGenerator.mjs'
import { forgot_password_email } from '../emails/onboarding.emails.mjs'
import { ObjectId } from 'bson';
import { Transaction } from "../models/transactions.model.mjs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { Admin } from "../../admin/models/admin.model.mjs";
import * as referralService from "../services/referral.service.mjs";
import { EACCOUNT_STATUS } from "../enums/user.enum.mjs";
import Commissions from "../models/commissions.model.mjs";
import { ECommissionType } from "../enums/commission.enum.mjs";
import * as s3Service from "../services/s3.service.mjs";

async function loginUser(body) {
  const { email, password, fcmToken } = body;

  const user = await User.findOne({ email: email, deleted: false });

  if (user) {
    if (user.account_status === EACCOUNT_STATUS.blacklisted) {
      return {
        data: null,
        message: "Your account has been blacklisted. Please contact your administrator.",
        status: false,
        statusCode: 401,
        accessToken: "",
      };
    }

    if (user.account_status === EACCOUNT_STATUS.suspended) {
      return {
        data: null,
        message: "Your account has been suspended. Please contact your administrator.",
        status: false,
        statusCode: 401,
        accessToken: "",
      };
    }

    const isPasswordValid = await new Promise((resolve, reject) => {
      pkg.compare(password, user.password, function (err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });

    if (isPasswordValid) {
      if (user.verified) {

        if (user.deleted) {
          return {
            data: {},
            message: "your account is deleted",
            status: false,
            statusCode: 401,
            accessToken: "",
          };

        } else {
          if (user.status) {

            await User.findByIdAndUpdate(user._id, { fcmToken: fcmToken });
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
              data: user,
              message: "user account is disabled by admin",
              status: false,
              statusCode: 401,
              accessToken: "",
            };
          }
        }
      } else {

        let otp = generateOTP();
        let update_user = await User.findByIdAndUpdate(user._id, { otp: otp }, { new: true });
        if (update_user) {
          const htmlTemplate = html(update_user.otp);
          sendMail(update_user.email, "OTP Verification", htmlTemplate);
        }

        return {
          data: { id: update_user?._id },
          message: "please verify email id",
          status: false,
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
  const userExist = await User.findOne({ email: body.email, deleted: false });

  if (userExist) {
    return {
      data: [],
      message: "email already exist ",
      status: false,
      statusCode: 409,
    };
  }

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
  body.myCode = await referralService.generateMyCode(8);
  const user = new User(body);
  await user.save();
  const htmlTemplate = html(user.otp, user.fullName);
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
  const { otp, id, fcmToken } = body;
  const user = await User.findById(id);
  if (user?.otp === otp) {
    const user_ = await User.findByIdAndUpdate({ _id: id }, { verified: true, otp: "", fcmToken: fcmToken });
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
  const { socialPlatform, email, email_verified, name, picture, exp, fcmToken, referralCode } = body;
  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (user) {
    if (user.account_status === EACCOUNT_STATUS.blacklisted) {
      return {
        data: null,
        message: "Your account has been blacklisted. Please contact your administrator.",
        status: false,
        statusCode: 401,
        accessToken: "",
      };
    }

    if (user.account_status === EACCOUNT_STATUS.suspended) {
      return {
        data: null,
        message: "Your account has been suspended. Please contact your administrator.",
        status: false,
        statusCode: 401,
        accessToken: "",
      };
    }
  }

  if (referralCode) {
    const validCode = await referralService.isMyCodeExistsInUsers(referralCode);
    if (!validCode) {
      return {
        data: {},
        message: "Invalid Referral code",
        status: false,
        statusCode: 400,
      };
    }
  }

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
      if (user) {
        await User.findByIdAndUpdate(user._id, { fcmToken: fcmToken })
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
          fcmToken: fcmToken
        };

        if (referralCode) {
          userPayload.referralCode = referralCode;
        }

        userPayload.myCode = await referralService.generateMyCode(8);
        const newUser = new User(userPayload);
        newUser.save();
        await User.findByIdAndUpdate(newUser._id, { fcmToken: fcmToken })

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
      if (user) {
        await User.findByIdAndUpdate(user._id, { fcmToken: fcmToken })
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
          fcmToken: fcmToken
        };

        if (referralCode) {
          userPayload.referralCode = referralCode;
        }

        userPayload.myCode = await referralService.generateMyCode(8);
        const newUser = new User(userPayload);
        newUser.save();
        await User.findByIdAndUpdate(newUser._id, { fcmToken: fcmToken })

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
      if (user) {
        await User.findByIdAndUpdate(user._id, { fcmToken: fcmToken })
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
          fcmToken: fcmToken
        };

        if (referralCode) {
          userPayload.referralCode = referralCode;
        }
        userPayload.myCode = await referralService.generateMyCode(8);
        const newUser = new User(userPayload);
        newUser.save();
        await User.findByIdAndUpdate(newUser._id, { fcmToken: fcmToken })

        return {
          data: newUser,
          message: "login successfully",
          status: true,
          statusCode: 200,
          accessToken: await accessTokenGenerator(newUser),
        };
      }
    }
  }
}

async function forgotPasswordService(email) {
  const user = await User.findOne({ email: email, deleted : false }).lean().exec();
  if (user) {
    let otp = generateOTP();
    let update_user = await User.findByIdAndUpdate(user._id, { otp: otp }, { new: true });
    if (update_user) {
      forgot_password_email({
        email: update_user.email,
        otp: update_user.otp,
        user_id: update_user._id,
        fullName: update_user?.fullName
      });
      return {
        data: {
          id: update_user._id
        },
        message: "otp sent successfully",
        status: true,
        statusCode: 200,
      };
    }
    return {
      data: [],
      message: "Server Error",
      status: false,
      statusCode: 500,
    };
  }
  return {
    data: [],
    message: "User Not Found",
    status: false,
    statusCode: 404,
  };
}

async function favouritesProperties(id, req) {
  let { search } = req.query;
  let query = {};
  const { favorite } = await User.findById(id).select("favorite")
  const data_ = favorite?.map((i) => {
    return new ObjectId(i)
  })

  query._id = { $in: data_ }
  if (search) {
    query.$or = [
      { propertyName: { $regex: search, $options: "i" } },
    ]
  }
  const data = await Property.aggregate([
    {
      $match: query
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
    const { renterID, propertyName, rented } = await Property.findById(propertyID);
    if (!rented) {
      return {
        data: {},
        message: "Property not rented",
        status: false,
        statusCode: 404,
      }
    }
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



  } else if (role === UserRoles.PROPERTY_MANAGER) {
    const { renterID, propertyName, rented } = await Property.findById(propertyID);
    if (!rented) {
      return {
        data: {},
        message: "Property not rented",
        status: false,
        statusCode: 404,
      }
    }
    const data = new LeaseAggrements({
      propertyName: propertyName,
      propertyID: propertyID,
      renterID: renterID,
      uploadedAt: Date.now(),
      url: dataUrl,
      property_manager_id: userID,
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
  } else if (role === UserRoles.PROPERTY_MANAGER) {
    const data = await LeaseAggrements.find({ property_manager_id: id })
    return {
      data: data,
      message: "successfully fetched lease aggrements",
      status: true,
      statusCode: 200
    };
  }
}

async function getWalletDetails(id) {
  const { walletPoints, role, earned_rewards } = await User.findById(id);
  const results = await Wallet.aggregate([
    { $match: { userID: id } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const Deposited = results.find(result => result._id === 'CREDIT')?.totalAmount || 0;
  const Withdrawn = results.find(result => result._id === 'DEBIT')?.totalAmount || 0;
  const commission = await Commissions.aggregate([
    {
      $match: {
        type: ECommissionType.rent,
        to: id
      }
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: '$commission' }
      }
    }
  ])
  let RentCollected = 0;
  let EarnedRewards = Number(earned_rewards) || 0;

  let rent_transaction_query = {
    propertyID: { $exists: true }
  };
  if (role == UserRoles.LANDLORD) {
    rent_transaction_query.landlordID = id;
  } else if (role == UserRoles.PROPERTY_MANAGER) {
    rent_transaction_query.pmID = id;
  } else if (role == UserRoles.RENTER) {
    rent_transaction_query.renterID = id;
  }

  let rent_transaction_pipeline = [
    { $match: rent_transaction_query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }
      }
    }
  ]

  let rent_transactions = await Transaction.aggregate(rent_transaction_pipeline);
  if (rent_transactions && rent_transactions.length > 0) {
    RentCollected = rent_transactions[0].totalAmount || 0;
  }

  let total = Number(Deposited) + Number(Withdrawn) + RentCollected + EarnedRewards;
  let deposite_percentage = Deposited > 0 ? Number(Deposited) * 100 / total : 0;
  let withdrawn_percentage = Withdrawn > 0 ? Number(Withdrawn) * 100 / total : 0;
  let rent_collected_percentage = RentCollected > 0 ? Number(RentCollected) * 100 / total : 0;
  let earned_rewards_percentage = EarnedRewards > 0 ? Number(EarnedRewards) * 100 / total : 0;

  return {
    data: {
      walletPoints,
      Deposited,
      Withdrawn,
      RentCollected,
      EarnedRewards,
      deposite_percentage,
      withdrawn_percentage,
      rent_collected_percentage,
      earned_rewards_percentage,
      commission: commission?.[0]?.totalCommission ?? 0
    },
    message: "successfully fetched wallet stats",
    status: true,
    statusCode: 200
  };

}

async function deleteAggrementByID(userID, aggrementID, role) {
  if (role === UserRoles.RENTER) {
    const data = await LeaseAggrements.findByIdAndDelete(aggrementID)
    if (data) {
      const keyToDelete = await s3Service.getKeyNameForFileUploaded(data?.url);
      await s3Service.deleteFileFromAws(keyToDelete)
    }
    return {
      data,
      message: "successfully fetched lease aggrements",
      status: true,
      statusCode: 200
    };

  } else if (role === UserRoles.LANDLORD) {
    const data = await LeaseAggrements.findByIdAndDelete(aggrementID)
    if (data) {
      const keyToDelete = await s3Service.getKeyNameForFileUploaded(data?.url);
      await s3Service.deleteFileFromAws(keyToDelete)
    }
    return {
      data,
      message: "successfully deleted lease aggrements",
      status: true,
      statusCode: 200
    };
  } else if (role === UserRoles.PROPERTY_MANAGER) {
    const data = await LeaseAggrements.findOneAndDelete({
      _id: aggrementID,
      property_manager_id: userID
    })

    if (data) {
      const keyToDelete = await s3Service.getKeyNameForFileUploaded(data?.url);
      await s3Service.deleteFileFromAws(keyToDelete);

      return {
        data,
        message: "successfully deleted lease aggrements",
        status: true,
        statusCode: 200
      };
    }

    return {
      data: [],
      message: "Invalid Id",
      status: false,
      statusCode: 400
    };
  }
}

async function verifyUserOtp(user_id, otp) {
  let get_user = await User.findOne({ _id: user_id, otp: otp }).lean().exec();
  if (get_user) {
    let update_user = await User.findByIdAndUpdate(get_user._id, { otp: "" });
    return {
      data: {
        id: get_user._id,
        accessToken: await accessTokenGenerator(get_user),
      },
      message: "otp verified successfully",
      status: true,
      statusCode: 200,
    };
  }
  return {
    data: {},
    message: "otp not matched",
    status: false,
    statusCode: 400,
  };
}

async function getAdmins() {
  return await Admin.find().lean().exec();
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
  deleteAggrementByID,
  verifyUserOtp,
  getAdmins
};
