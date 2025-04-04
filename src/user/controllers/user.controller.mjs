import { userSignup, userLogin, userVerify, socialAuth, switchRoleValidation, shareReferralCodeValidation, verifyReferralCodeValidation } from "../validations/user.validation.mjs";
import { validator } from "../helpers/schema-validator.mjs";
import {
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
  verifyUserOtp
} from "../services/user.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { User } from '../models/user.model.mjs'
import * as bcrypt from "bcrypt";
import { Property } from "../models/property.model.mjs";
import { Maintenance } from "../models/maintenance.model.mjs";
import { accessTokenGenerator } from "../helpers/accessTokenGenerator.mjs";
import * as referralService from "../services/referral.service.mjs";
import { EShareVia } from "../enums/referral.enum.mjs";
import * as referralEmailService from "../emails/referral.emails.mjs"
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import * as NotificationService from "../services/notification.service.mjs";
import * as s3Service from "../services/s3.service.mjs";
import { Calender } from "../models/calender.model.mjs";
import Cards from "../models/cards.model.mjs";
import CreditScores from "../models/creditscore.model.mjs";

async function deleteUser(req, res) {
  try {
    const id = req.user.data._id;
    const query = {};
    switch (req.user.data.role) {
      case UserRoles.LANDLORD:
        query.landlord_id = id;
        query.rented = true;
        break;

      case UserRoles.PROPERTY_MANAGER:
        query.property_manager_id = id;
        break;

      case UserRoles.RENTER:
        query.renterID = id;
        query.rented = true;
        break
    }
    const get_rented_properties = await Property.findOne(query);
    if (get_rented_properties) {
      return sendResponse(res, null, 'Terminate tenancy or lease property first', false, 400)
    }
    const data = await User.findOneAndUpdate({
      _id: id,
      deleted: false
    }, { deleted: true });
    if (data) {
      await Calender.deleteMany({       // Deleting calender blocked dates
        userID: id
      });

      await Cards.deleteMany({        // Deleting cards
        user_id: id
      })

      await CreditScores.deleteMany({
        user_id: id
      })
      return sendResponse(res, {}, 'successfully deleted data', true, 200)
    }
    return sendResponse(res, null, "Server Error", false, 500);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function login(req, res) {
  const { body } = req;
  body.email = body.email.toLowerCase().trim();
  const data = await loginUser(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );

}

async function signup(req, res) {
  const { body } = req;
  const { referralCode } = body;

  const { isError, errors } = validator(body, userSignup);

  if (isError) {
    sendResponse(res, [], errors, false, 403);
  } else {
    body.initial_role = body.role;

    if (referralCode) {
      const validCode = await referralService.isMyCodeExistsInUsers(referralCode);
      if (!validCode) {
        // return res.status(400).json({ msg: "Invalid Referral code" });
        sendResponse(
          res,
          null,
          "Invalid Referral code",
          false,
          400
        );
      }
    }

    body.email = body.email.toLowerCase().trim();
    const data = await addUser(body);

    sendResponse(
      res,
      { id: data?.data?._id, otp: data?.data?.otp },
      data.message,
      data.status,
      data.statusCode
    );
  }
}

async function userVerification(req, res) {
  const { body } = req;

  const data = await verifyOtp(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data?.accessToken
  );
}

async function favourites(req, res) {

  const id = req.user.data._id;

  const data = await favouritesProperties(id, req);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );

}

async function socialLogin(req, res) {
  const { body } = req;

  const data = await socialSignup(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function myprofile(req, res) {
  const { _id, role } = req.user.data;
  const data = await myProfileDetails(_id, role);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function forgotPassword(req, res) {

  const { email } = req.body;

  const data = await forgotPasswordService(email);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function uploadLeaseAggrement(req, res) {
  const role = req.user.data.role;
  const propertyID = req.body.propertyID;

  const userID = req.user.data._id;

  const dataUrl = req.documents;
  const data = await uploadLeaseAggrementService(propertyID, userID, role, dataUrl);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function getLeaseAggrements(req, res) {

  const { _id, role } = req.user.data;


  const data = await getLeaseAggrementList(_id, role);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function wallet(req, res) {
  const { _id } = req.user.data;


  const data = await getWalletDetails(_id);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );

}

async function deleteAggrement(req, res) {
  const { _id, role } = req.user.data;
  const { id } = req.params;


  const data = await deleteAggrementByID(_id, id, role);
  sendResponse(
    res,
    null,
    data.message,
    data.status,
    data.statusCode
  );

}

async function userOtpVerification(req, res) {
  let { id, otp } = req.body;
  const data = await verifyUserOtp(id, otp);
  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode
  );
}

async function resetPassword(req, res) {
  try {
    let { password } = req.body;
    let get_user = await User.findOne({ _id: req.user.data._id }).lean().exec();
    if (get_user) {
      let hash_password = bcrypt.hashSync(password, Number(process.env.SALT));
      let update_user = await User.findByIdAndUpdate(get_user._id,
        {
          password: hash_password
        }
      );
      return sendResponse(res, {}, "Password reset successfully", true, 200);
    }
    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function editMyProfile(req, res) {
  try {
    let id = req.user.data._id;
    let get_user = await User.findOne({
      _id: id,
      deleted: false
    });
    if (get_user) {
      delete req.body.email;
      delete req.body.password;
      delete req.body.otp;
      delete req.body.role;
      let update_user = await User.findByIdAndUpdate(id,
        req.body,
        { new: true }
      );

      if (update_user) {
        delete update_user.email;
        delete update_user.password;
        delete update_user.otp;
        if (get_user.picture != update_user.picture) {
          // Delete old picture
          if (get_user?.picture) {
            const keyToDelete = await s3Service.getKeyNameForFileUploaded(get_user?.picture);
            await s3Service.deleteFileFromAws(keyToDelete)
          }
        }
        return sendResponse(res, update_user, "Profile updated successfully", true, 200);
      }
    }

    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function teriminateRenter(req, res) {
  try {
    const propertyID = req.params.id;
    const property = await Property.findByIdAndUpdate(propertyID, {
      rented: false,
      rent_period_end: "",
      rent_period_start: "",
      renterID: null,
      payment_count: 0,
      next_payment_at: null
    })

    await Maintenance.deleteMany({ propertyID: propertyID });

    // Sending system notification to renter
    User.findById(property.renterID).then(renter_details => {

      // Sending system notification to renter
      const notification_payload = {};
      notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
      notification_payload.notificationHeading = "Tenancy Terminated";
      notification_payload.notificationBody = `${req?.user?.data?.role == UserRoles.LANDLORD ? "Landlord" : "Property Manager"} ${req?.user?.data?.fullName} terminated you tenancy for property ${property?.propertyName}`;
      notification_payload.landlordID = property?.landlord_id;
      notification_payload.propertyID = property._id;
      notification_payload.send_to = renter_details._id;
      notification_payload.property_manager_id = property?.property_manager_id;
      const metadata = {
        "propertyID": property._id.toString(),
        "redirectTo": "property",
      }
      NotificationService.createNotification(notification_payload, metadata, renter_details)
    })

    return sendResponse(res, [], `terminated successfully`, true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function commisions(req, res) {

  const userID = req.user.data._id;

  const data = await Property.aggregate([
    {
      $match: {
        property_manager_id: userID  // Match the property_manager_id
      }
    },
    {
      $addFields: {
        propertyIDStr: { $toString: "$_id" }  // Convert _id to string for matching
      }
    },
    {
      $lookup: {
        from: "transactions",               // The transactions collection
        let: { propertyIDStr: "$propertyIDStr" }, // Variable for the property ID string
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$propertyID", "$$propertyIDStr"] } // Match propertyID with the propertyIDStr
            }
          },
          {
            $project: {
              _id: 0,                        // Exclude _id from the transactions if not needed
              allCharges: 1,
              date: 1                  // Include allCharges field
            }
          }
        ],
        as: "transactions"                  // Output array field
      }
    },
    {
      $unwind: "$transactions"              // Flatten the transactions array
    },
    {
      $match: {
        "transactions.allCharges.agent_fee": { $exists: true, $ne: null } // Ensure agent_fee is present and not null
      }
    },
    {
      $project: {
        images: 1,
        propertyName: 1,                   // Include propertyName from properties
        address: 1,                        // Include address from properties
        commision: "$transactions.allCharges.agent_fee",// Include agent_fee from transactions
        rent: "$transactions.allCharges.rent",
        date: "$transactions.date"
      }
    }
  ])


  sendResponse(res, data, "commsision list fetched", true, 200);

}

const getUserDetails = async (req, res) => {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "Id is required", false, 400);
    }

    let data = await User.findById(id, {
      password: 0,
      otp: 0,
      kinDetails: 0
    }).lean().exec();

    if (data) {
      return sendResponse(res, data, "User details fetched", true, 200);
    }
    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function switchRole(req, res) {
  try {
    const { isError, errors } = validator(req.body, switchRoleValidation);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }
    const user_id = req?.user?.data?._id;
    let { role } = req.body;

    if (role === req?.user?.data?.role) {
      return sendResponse(res, {}, "You are already on same role", false, 404);
    }

    let update_user = await User.findByIdAndUpdate(user_id,
      {
        role: role
      },
      { new: true }
    );

    if (update_user) {
      const accessToken = await accessTokenGenerator(update_user);
      delete update_user.password;
      delete update_user.otp;
      return sendResponse(res, update_user, "Profile switched successfully", true, 200, accessToken);
    }

    return sendResponse(res, {}, "User not found", false, 404);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function shareReferralCode(req, res) {
  try {
    const { isError, errors } = validator(req.body, shareReferralCodeValidation);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    if (req.body.share_via === EShareVia.email) {
      referralEmailService.sendReferralLink({
        email: req.body.refer_to,
        referralCode: req?.user?.data?.myCode
      });

      return sendResponse(res, {}, "Success", true, 200);
    }
    return sendResponse(res, {}, "Invalid Share Type", false, 400);
  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

async function verifyReferralCode(req, res) {
  try {
    const { isError, errors } = validator(req.body, verifyReferralCodeValidation);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    const validCode = await referralService.isMyCodeExistsInUsers(req.body.referralCode);
    if (validCode) {
      return sendResponse(res, {}, "Success", true, 200);
    }

    return sendResponse(res, {}, "Invalid Referral Code", false, 400);
  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

export {
  deleteUser,
  teriminateRenter,
  deleteAggrement,
  wallet,
  login,
  signup,
  userVerification,
  socialLogin,
  myprofile,
  forgotPassword,
  favourites,
  uploadLeaseAggrement,
  getLeaseAggrements,
  userOtpVerification,
  resetPassword,
  editMyProfile,
  commisions,
  getUserDetails,
  switchRole,
  shareReferralCode,
  verifyReferralCode
};
