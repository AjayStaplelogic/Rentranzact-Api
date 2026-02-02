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
import * as PropertyServices from "../../user/services/property.service.mjs";
import { RentApplicationStatus } from "../../user/enums/rentApplication.enums.mjs";
import moment from "moment";
import { RentingHistory } from "../../user/models/rentingHistory.model.mjs";


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
    const { propertyID, identificationType, rent_expiration_date } = body;

    const landlord = await Property.findById(propertyID);
    let payload = {
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
    const breakdown = PropertyServices.getRentalBreakUp(landlord);
    payload = {
      ...payload,
      applicationStatus: RentApplicationStatus.ACCEPTED,
      rent: breakdown?.rent ?? 0,
      insurance: breakdown?.insurance ?? 0,
      legal_Fee: breakdown?.legal_Fee ?? 0,
      caution_deposite: breakdown?.caution_deposite ?? 0,
      total_amount: breakdown?.total_amount ?? 0,
      agency_fee: breakdown?.agency_fee ?? 0,
      agent_fee: breakdown?.agent_fee ?? 0,
      rtz_fee: breakdown?.rtz_fee ?? 0,
      landlord_earning: breakdown?.landlord_earning ?? 0,
    };

    let data = await rentApplication.create(payload);
    if (data) {
      const propertyDetails = landlord;
      // ********************** Skiping payment flow ****************//
      let lease_end_timestamp = "";
      if (["commercial", "residential"].includes(propertyDetails.category)) {
        lease_end_timestamp = moment().add(1, "years").unix();
      } else if (propertyDetails.category === "short stay") {
        lease_end_timestamp = moment().add(1, "months").unix();
      }

      const updateProperty = await Property.findByIdAndUpdate(data.propertyID, {
        rented: true,
        renterID: data.renterID,
        rent_period_start: moment().unix().toString(),
        rent_period_end: moment(rent_expiration_date).unix(),
        rent_period_due: moment(rent_expiration_date).unix(),
        payment_count: 1,
        lease_end_timestamp: lease_end_timestamp,
        inDemand: false,        // setting this to false because when property is rented then should remove from in demand
        next_payment_at: new Date(rent_expiration_date)
      }, {
        new: true
      });

      if (updateProperty) {
        const addRenterHistory = new RentingHistory({
          renterID: updateProperty.renterID,
          landlordID: updateProperty?.landlord_id,
          rentingType: updateProperty?.rentType,
          rentingEnd: updateProperty?.rent_period_end,
          rentingStart: updateProperty?.rent_period_start,
          propertyID: updateProperty?._id,
          renterActive: true,
          pmID: updateProperty?.property_manager_id,
        })

        addRenterHistory.save()
      }

      // ********************** Skiping payment flow ****************//
      
      // Sending email to lady
      InviteEmails.notifyRenterPropertyLinked({
        email: renterDetails.email,
        property_id: landlord._id,
        address: landlord?.address?.addressText,
        property_name: landlord?.propertyName,
        rent_expiration_date: rent_expiration_date ?? ""
      });
      

      User.findById(landlord.landlord_id).then(async (landlordDetails) => {
        if (landlordDetails) {
          let notification_payload = {};
          notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
          notification_payload.notificationHeading = "Admin Linked Renter";
          notification_payload.notificationBody = `Admin linked renter ${renterDetails.fullName} to ${landlord.propertyName}`;
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

          // Informing to landlord via email
          InviteEmails.notifyLandlordPropertyLinked({
            email: landlordDetails.email,
            property_id: landlord._id,
            address: landlord?.address?.addressText,
            property_name: landlord?.propertyName,
            rent_expiration_date: rent_expiration_date ?? "",
            renter_name: renterDetails?.fullName ?? ""
          });
        }
      })

      await User.findById(landlord.property_manager_id).then(async (propertyManagerDetails) => {
        if (propertyManagerDetails) {
          let notification_payload = {};
          notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
          notification_payload.notificationHeading = "Admin Linked Renter";
          notification_payload.notificationBody = `Admin linked renter ${renterDetails.fullName} to ${landlord.propertyName}`;
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

          // Informing to property manager via email
          InviteEmails.notifyLandlordPropertyLinked({
            email: propertyManagerDetails.email,
            property_id: landlord._id,
            address: landlord?.address?.addressText,
            property_name: landlord?.propertyName,
            rent_expiration_date: rent_expiration_date ?? "",
            renter_name: renterDetails?.fullName ?? ""
          });
        }
      })


      return {
        data: data,
        message: "Renter linked to property successfully",
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
    console.log(error,'======error')
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