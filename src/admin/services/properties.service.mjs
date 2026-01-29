import { LeaseAggrements } from "../../user/models/leaseAggrements.model.mjs";
import { Property } from "../../user/models/property.model.mjs";
import { ObjectId } from 'bson';
import { Inspection } from "../../user/models/inspection.model.mjs";
import { InspectionStatus } from "../../user/enums/inspection.enums.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import { User } from "../../user/models/user.model.mjs";
import { rentApplication } from "../../user/models/rentApplication.model.mjs";
import { identityVerifier } from "../../user/helpers/identityVerifier.mjs";
import * as NotificationService from "../../user/services/notification.service.mjs";
import * as InviteEmails from "../../user/emails/invite.emails.mjs"
import { Db } from "mongodb";

async function leaseAggrementsList(req) {
  let { filters, search } = req.query;
  const query = {};
  if (filters) {
    query.uploadedBy = filters
  }

  if (search) {
    query.$or = [
      { propertyName: { $regex: search, $options: 'i' } },
    ]
  }

  const data = await LeaseAggrements.find(query)
  return {
    data: data,
    message: `successfully fetched  list`,
    status: true,
    statusCode: 201,
  };
}

async function getPropertiesList() {
  const data = await Property.aggregate([{
    $lookup: {
      from: "users",
      let: { renter_ID: { $toObjectId: "$landlord_id" } },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$renter_ID"] }
          }
        },
        {
          $project: {
            _id: 1,
            fullName: 1, // Include fullName field from users collection
            countryCode: 1,
            phone: 1

          }
        }
      ],
      as: "landlord_info",

    }
  }, {

    $lookup: {
      from: "users",
      let: { renter_ID: { $toObjectId: "$property_manager_id" } },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$renter_ID"] }
          }
        },
        {
          $project: {
            _id: 1,
            fullName: 1, // Include fullName field from users collection
            countryCode: 1,
            phone: 1,
            picture: 1

          }
        }
      ],
      as: "propertyManager_info",

    }

  }
  ])

  return {
    data: data,
    message: `successfully fetched  list`,
    status: true,
    statusCode: 201,
  };
}

async function getPropertyByID(id) {
  const id1 = new ObjectId(id)
  const data = await Property.aggregate([
    {

      $match: {
        "_id": id1
      }
    },

    {
      $lookup: {
        from: "users",
        let: { renter_ID: { $toObjectId: "$landlord_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$renter_ID"] }
            }
          }
        ],
        as: "landlord_info",

      }
    },
    {
      $lookup: {
        from: "users",
        let: { renter_ID: { $toObjectId: "$renterID" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$renter_ID"] }
            }
          },
          {
            $project: {
              _id: 1,
              fullName: 1, // Include fullName field from users collection
              countryCode: 1,
              phone: 1,
              picture: 1,
              email: 1
            }
          }
        ],
        as: "renterInfo",

      }
    },
    {
      $lookup: {
        from: "users",
        let: { renter_ID: { $toObjectId: "$property_manager_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$renter_ID"] }
            }
          },
          {
            $project: {
              _id: 1,
              fullName: 1, // Include fullName field from users collection
              countryCode: 1,
              phone: 1,
              picture: 1,
              email: 1
            }
          }
        ],
        as: "property_manager",
      }
    },
  ])

  return {
    data: data,
    message: `successfully fetched  list`,
    status: true,
    statusCode: 201,
  };

}

async function deletePropertyByID(id) {
  try {
    const data = await Inspection.find({
      inspectionStatus: InspectionStatus.ACCEPTED,
      propertyID: id
    });

    if (data.length > 0) {
      return {
        data: [],
        message: "Unable To Delete Property",
        status: false,
        statusCode: 400,
      };
    }

    const property = await Property.findByIdAndDelete(id);
    if (property) {
      await Notification.deleteMany({
        propertyID: id,
        amount: {
          $gt: 0
        },
        redirect_to: ENOTIFICATION_REDIRECT_PATHS.rent_payment_screen
      });
      return {
        data: data,
        message: "Property Deleted Successfully",
        status: true,
        statusCode: 200,
      };
    }
    return {
      data: [],
      message: "Invalid Id",
      status: false,
      statusCode: 400,
    };
  } catch (error) {
    return {
      data: [],
      message: error.message,
      status: false,
      statusCode: 400,
    };
  }
}

async function addRentApplicationFromAdmin(body) {
  try {
    if (!body.renterID) {
      return {
        data: null,
        message: "Renter Id is required",
        status: false,
        statusCode: 400,
      };
    }

    const renterID = body.renterID;
    const { propertyID, identificationType } = body;

    const landlord = await Property.findById(propertyID);
    const payload = {
      propertyID: propertyID,
      propertyCategory: landlord?.category,
      renterID: renterID,
      landlordID: landlord.landlord_id,
      pmID: landlord.property_manager_id,
      propertyName: landlord.propertyName,

      firstName: body.firstName || "",
      middleName: body.middleName || "",
      lastName: body.lastName || "",
      emailID: body.emailID || "",
      contactNumber: body.contactNumber,
      alternativeContactNumber: body.alternativeContactNumber || "",
      gender: body.gender || "",
      maritialStatus: body.maritialStatus || "",
      identitiy_doc: body.identitiy_doc || "",
      // invitation_token: body.invitation_token || "",
      kinDOB: body.kinDOB || "",

      // verification rlated keys
      verifcationType: body.identificationType,
      voter_id: body.voter_id || "",
      bvn: body.bvn || "",
      nin: body.nin || "",
    };

    // verifying personal details
    let smile_identification_payload = {
      first_name: body.firstName,
      last_name: body.lastName,
      middle_name: body.middleName,
      bvn: body.bvn,
      dob: body.kinDOB,
      nin: body.nin,
      voter_id: body.voter_id,
      kinContactNumber: body.contactNumber,
      kinEmail: body.emailID,
    }
    const verifyStatus = await identityVerifier(identificationType, smile_identification_payload);     // uncomment this code after client recharge for smile identity verification

    if (!verifyStatus) {
      return {
        data: [],
        message: "Personal information is incorrect",
        status: false,
        statusCode: 400,
      };
    }

    //add kin details to the user
    payload["isPersonalDetailsVerified"] = true;
    const renterDetails = await User.findById(renterID);
    let data = await rentApplication.create(payload);
    if (data) {

      const owner = await User.findById(landlord.landlord_id).lean()
      // Sending email to lady
      InviteEmails.notifyRenterLinkingInitialized({
        email: renterDetails.email,
        property_id: landlord._id,
        address: landlord?.address?.addressText,
        property_name : landlord?.propertyName,
        landlord_name : owner?.fullName ?? ""
      });

      User.findById(landlord.landlord_id).then(async (landlordDetails) => {
        if (landlordDetails) {
          let notification_payload = {};
          notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
          notification_payload.notificationHeading = "Rent Application Update";
          notification_payload.notificationBody = `Admin applied renter application on behalf of ${renterDetails.fullName} for ${landlord.propertyName}`;
          notification_payload.renterID = renterID;
          notification_payload.landlordID = landlord.landlord_id;
          notification_payload.renterApplicationID = data._id;
          notification_payload.propertyID = landlord._id;
          notification_payload.send_to = landlordDetails._id;
          notification_payload.amount = landlord.rent;

          const metadata = {
            "propertyID": landlord._id.toString(),
            "redirectTo": "rentApplication",
            "rentApplication": data._id.toString()
          }
          NotificationService.createNotification(notification_payload, metadata, landlordDetails)
        }
      })

      await User.findById(landlord.property_manager_id).then(async (propertyManagerDetails) => {
        if (propertyManagerDetails) {
          let notification_payload = {};
          notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
          notification_payload.notificationHeading = "Rent Application Update";
          notification_payload.notificationBody = `Admin applied renter application on behalf of ${renterDetails.fullName} for ${landlord.propertyName}`;
          notification_payload.renterID = renterID;
          notification_payload.landlordID = landlord?.landlord_id;
          notification_payload.renterApplicationID = data._id;
          notification_payload.propertyID = landlord._id;
          notification_payload.send_to = propertyManagerDetails._id;
          notification_payload.property_manager_id = propertyManagerDetails._id;
          notification_payload.amount = landlord.rent;

          const metadata = {
            "propertyID": landlord._id.toString(),
            "redirectTo": "rentApplication",
            "rentApplication": data._id.toString()
          }
          NotificationService.createNotification(notification_payload, metadata, propertyManagerDetails)
        }
      })


      return {
        data: data,
        message: "rent application successfully created",
        status: true,
        statusCode: 200,
      };
    }
    return {
      data: [],
      message: "Something went wrong",
      status: false,
      statusCode: 400,
    };


  } catch (error) {
    return {
      data: [],
      message: `${error}`,
      status: false,
      statusCode: 400,
    };
  }
}
export {
  getPropertiesList,
  getPropertyByID,
  deletePropertyByID,
  leaseAggrementsList,
  addRentApplicationFromAdmin
}