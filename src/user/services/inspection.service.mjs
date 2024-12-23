import { Inspection } from "../models/inspection.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { InspectionStatus } from "../enums/inspection.enums.mjs";
import moment from "moment";
import sendNotification from "../helpers/sendNotification.mjs";
import { Notification } from "../models/notification.model.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import * as NotificationService from "./notification.service.mjs";

async function createInspection(body, renterID) {
  const { propertyID, inspectionDate, inspectionTime, id, _id } = body;

  const property = await Property.findById(propertyID);
  if (!property) {
    return {
      data: {},
      message: "Invalid property Id",
      status: false,
      statusCode: 400
    };
  }

  const renterDetails = await User.findById(renterID);

  const landlordDetails = await User.findById(property.landlord_id)

  const { fullName, picture, phone, countryCode, email } = renterDetails;


  const payload = {
    ...body
  }

  payload.renterID = renterID;
  payload.RenterDetails = {
    id: renterID,
    fullName: fullName,
    picture: picture,
    countryCode: countryCode,
    phone: phone,
    email: email
  };

  // console.log(property, "==========property")

  payload.propertyName = property.propertyName;
  payload.addressText = property.address.addressText;
  payload.landlordID = property.landlord_id;
  payload.property_manager_id = property.property_manager_id;
  payload.images = property.images;

  if (landlordDetails) {
    payload.landlordEmail = landlordDetails.email;
    payload.landlordName = landlordDetails.fullName;
  }


  payload.id = id;
  if (!_id) {
    const data = new Inspection(payload);
    data.save();

    let property_manger_details = await User.findById(property.property_manager_id);
    if (landlordDetails) {
      let notification_payload = {};
      notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.inspection_view;
      notification_payload.notificationHeading = "Inspection Update";
      notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} applied inspection for ${property?.propertyName ?? ""}`;
      notification_payload.renterID = renterDetails._id;
      notification_payload.landlordID = landlordDetails._id;
      notification_payload.inspection_id = data._id;
      notification_payload.propertyID = data.propertyID;
      notification_payload.send_to = landlordDetails._id;
      const metadata = {
        "propertyID": data.propertyID.toString(),
        "redirectTo": "inspection",
        "inspection_id": data._id,
      }
      NotificationService.createNotification(notification_payload, metadata, landlordDetails)
      // let create_notification = await Notification.create(notification_payload);
      // if (create_notification) {
      //   if (landlordDetails && landlordDetails.fcmToken) {
      //     const metadata = {
      //       "propertyID": data.propertyID.toString(),
      //       "redirectTo": "inspection",
      //       "inspection_id": create_notification.inspection_id,
      //     }
      //     sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
      //   }
      // }
    }

    if (property_manger_details) {
      let notification_payload = {};
      notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.inspection_view;
      notification_payload.notificationHeading = "Inspection Update";
      notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} applied inspection for ${property?.propertyName ?? ""}`;
      notification_payload.renterID = renterDetails._id;
      notification_payload.landlordID = landlordDetails?._id;
      notification_payload.inspection_id = data._id;
      notification_payload.propertyID = data.propertyID;
      notification_payload.send_to = property_manger_details?._id;
      notification_payload.property_manager_id = property_manger_details?._id;

                const metadata = {
            "propertyID": data.propertyID.toString(),
            "redirectTo": "inspection",
            "inspection_id": data._id,
          }

          NotificationService.createNotification(notification_payload, metadata, property_manger_details)

      // let create_notification = await Notification.create(notification_payload);
      // if (create_notification) {
      //   if (property_manger_details && property_manger_details.fcmToken) {
      //     const metadata = {
      //       "propertyID": data.propertyID.toString(),
      //       "redirectTo": "inspection",
      //       "inspection_id": create_notification.inspection_id,
      //     }
      //     sendNotification(property_manger_details, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.PROPERTY_MANAGER)
      //   }
      // }
    }

    return {
      data: data,
      message: "successfully booked inspection",
      status: true,
      statusCode: 201
    };
  }

  return {
    data: [],
    message: "successfully booked inspection",
    status: true,
    statusCode: 201
  };
}

async function fetchInspections(userData, req) {
  let { search, status } = req.query;
  if (userData.role === UserRoles.LANDLORD) {
    let query = {
      landlordID: userData?._id
    }
    if (search) {
      query.$or = [
        { propertyName: { $regex: search, $options: "i" } },
        { "RenterDetails.fullName": { $regex: search, $options: "i" } },
        { landlordName: { $regex: search, $options: "i" } },
      ]
    }
    if (status) {
      query.inspectionStatus = status;
    }
    const data = await Inspection.find(query).sort({ createdAt: -1 });

    return {
      data: data,
      message: "inspection list fetched successfully",
      status: true,
      statusCode: 200,
    };
  } else if (userData.role === UserRoles.PROPERTY_MANAGER) {
    let query = {
      property_manager_id: userData?._id
    }
    if (search) {
      query.$or = [
        { propertyName: { $regex: search, $options: "i" } },
        { "RenterDetails.fullName": { $regex: search, $options: "i" } },
        { landlordName: { $regex: search, $options: "i" } },
      ]
    }
    if (status) {
      query.inspectionStatus = status;
    }
    const data = await Inspection.find(query).sort({ createdAt: -1 });
    return {
      data: data,
      message: "inspection list fetched successfully",
      status: true,
      statusCode: 200,
    };
  } else if (userData.role === UserRoles.RENTER) {
    const data2 = await Inspection.find({
      "RenterDetails.id": userData?._id,
    });

    let query = {
      "RenterDetails.id": userData?._id,
    }
    if (search) {
      query.$or = [
        { propertyName: { $regex: search, $options: "i" } },
        { "RenterDetails.fullName": { $regex: search, $options: "i" } },
        { landlordName: { $regex: search, $options: "i" } },
      ]
    }
    if (status) {
      query.inspectionStatus = status;
    }
    // Import ObjectId from MongoDB driver
    const data = await Inspection.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "properties",
          let: { propertyID: { $toObjectId: "$propertyID" } }, // Convert propertyID to ObjectId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$propertyID"] }, // Match ObjectId type
              },
            },
            { $project: { images: 1, propertyName: 1, address: 1 } }, // Project only the images array from properties
          ],
          as: "propertyDetails",
        },
      },
      {
        $unwind: "$propertyDetails", // Unwind to destructure the array from the lookup
      },
      {
        $project: {
          _id: 1,
          landlordEmail: 1,
          landlordName: 1,
          RenterDetails: 1,
          inspectionTime: 1,
          inspectionDate: 1,
          message: 1,
          inspectionApproved: 1,
          inspectionStatus: 1,
          propertyID: 1,
          landlordID: 1,
          property_manager_id: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          "propertyDetails.images": 1, // Include only the images array from propertyDetails
          "propertyDetails.propertyName": 1,
          "propertyDetails.address": 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order$s
      }
    ]);



    return {
      data: data,
      message: "inspection list fetched successfully",
      status: true,
      statusCode: 200,
    };
  }
}

async function updateInspectionStatus(body, id) {
  const { status, inspectionID, reason } = body;

  const inspectionDetails = await Inspection.findById(inspectionID);

  // const renterDetails = await User.findById(inspectionDetails?.RenterDetails?.id);
  // const landlordDetails = await User.findById(inspectionDetails.landlordID);

  let notification_payload = {};
  notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.inspection_view;
  notification_payload.notificationHeading = "Inspection Update";
  notification_payload.renterID = inspectionDetails?.RenterDetails?.id;
  notification_payload.landlordID = inspectionDetails.landlordID;
  notification_payload.inspection_id = inspectionDetails?._id;
  notification_payload.propertyID = inspectionDetails?.propertyID;
  notification_payload.send_to = inspectionDetails?.landlordID;
  notification_payload.property_manager_id = inspectionDetails?.property_manager_id;

  let update_payload = {
    inspectionStatus: status
  };

  if (InspectionStatus.CANCELED === status) {
    update_payload.canceledID = id;
    if (reason) {
      update_payload.cancelReason = reason;
    }
    // notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is cancelled by ${inspectionDetails.landlordName}`
    notification_payload.send_to = inspectionDetails?.RenterDetails?.id;
    notification_payload.notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is cancelled by ${inspectionDetails.landlordName}`;
    // console.log(notificationBody, "---notification body in condition")
  }

  if (InspectionStatus.ACCEPTED === status) {
    update_payload.acceptedBy = id;
    // notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is accepted by ${inspectionDetails.landlordName}`
    notification_payload.send_to = inspectionDetails?.RenterDetails?.id;
    notification_payload.notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is accepted by ${inspectionDetails.landlordName}`;
  }

  if (InspectionStatus.COMPLETED === status) {
    update_payload.approverID = id;
    // notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is accepted by ${inspectionDetails.landlordName}`
    notification_payload.notificationBody = `Your Inspection for ${inspectionDetails.propertyName} is completed by ${inspectionDetails.landlordName}`;
  }

  const data = await Inspection.findByIdAndUpdate(inspectionID, update_payload, { new: true });

  const metadata = {
    "propertyID": data.propertyID.toString(),
    "redirectTo": "inspection",
    "inspection_id": data._id,
  }

  NotificationService.createNotification(notification_payload, metadata, false)

  // let create_notification = await Notification.create(notification_payload);
  // if (create_notification) {
  //   User.findById(create_notification.send_to).then((send_to_details) => {
  //     if (send_to_details && send_to_details.fcmToken) {

  //       sendNotification(send_to_details, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, send_to_details.role)
  //     }
  //   })
  // }
  // console.log(notificationBody, "----notificationBody")

  // const data_ = await sendNotification(renterDetails, "single", title, notificationBody, metadata, UserRoles.RENTER)

  return {
    data: data,
    message: "inspection status changed successfully",
    status: true,
    statusCode: 200,
  };
}

async function inspectionEditService(body) {
  const { inspectionID, inspectionTime, inspectionDate, message, id } = body;
  let payload = {};
  if (inspectionTime) {
    payload.inspectionTime = inspectionTime;
  }

  if (inspectionDate) {
    payload.inspectionDate = inspectionDate;
  }

  if (message) {
    payload.message = message;
  }
  if (id) {
    payload.id = id;
  }
  payload.inspectionStatus = InspectionStatus.INITIATED;
  const data = await Inspection.findByIdAndUpdate(inspectionID, payload, { new: true });
  if (data) {
    Property.findById(data.propertyID).then((property) => {
      if (property) {
        if (property.landlord_id) {
          User.findById(property.landlord_id).then(async (landlordDetails) => {
            if (landlordDetails) {
              let notification_payload = {};
              notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.inspection_view;
              notification_payload.notificationHeading = "Inspection Request Updated";
              notification_payload.notificationBody = `Inspection request updated for ${property?.propertyName ?? ""}`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = landlordDetails._id;
              notification_payload.inspection_id = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = landlordDetails._id;

              const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "inspection",
                "inspection_id": data._id,
              }
            
              NotificationService.createNotification(notification_payload, metadata, landlordDetails)

              // let create_notification = await Notification.create(notification_payload);
              // if (create_notification) {
              //   if (landlordDetails && landlordDetails.fcmToken) {
              //     const metadata = {
              //       "propertyID": data.propertyID.toString(),
              //       "redirectTo": "inspection",
              //       "inspection_id": create_notification.inspection_id,
              //     }
              //     sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
              //   }
              // }
            }
          })
        }

        if (property.property_manager_id) {
          User.findById(property.landlord_id).then(async (property_manger_details) => {
            if (property_manger_details) {
              let notification_payload = {};
              notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.inspection_view;
              notification_payload.notificationHeading = "Inspection Request Updated";
              notification_payload.notificationBody = `Inspection request updated for ${property?.propertyName ?? ""}`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = property.landlord_id;
              notification_payload.inspection_id = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = property_manger_details?._id;
              notification_payload.property_manager_id = property_manger_details?._id;

              const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "inspection",
                "inspection_id": data._id,
              }
            
              NotificationService.createNotification(notification_payload, metadata, property_manger_details)


              // let create_notification = await Notification.create(notification_payload);
              // if (create_notification) {
              //   if (property_manger_details && property_manger_details.fcmToken) {
              //     const metadata = {
              //       "propertyID": data.propertyID.toString(),
              //       "redirectTo": "inspection",
              //       "inspection_id": create_notification.inspection_id,
              //     }
              //     sendNotification(property_manger_details, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.PROPERTY_MANAGER)
              //   }
              // }
            }
          })
        }
      }
    });


    return {
      data: data,
      message: "inspection updated successfully",
      status: true,
      statusCode: 200,
    };
  }

  return {
    data: {},
    message: "Invalid Id",
    status: false,
    statusCode: 400,
  };
}

async function getAvailableDatesService(id) {
  const data = await Inspection.find(
    { propertyID: id },
    { inspectionTime: 1, inspectionDate: 1, _id: 0 }
  ).exec();

  return {
    data: data,
    message: "successfully fetched available dates",
    status: true,
    statusCode: 200,
  };
}

async function getInspectionsByUserID(id, role, PropertyID) {
  let data;
  if (role === UserRoles.LANDLORD) {
    data = await Inspection.find({
      landlordID: id,
      propertyID: PropertyID
    })
  }
  return {
    data: data,
    message: "rent application completed successfully",
    status: true,
    statusCode: 200,
  };

}

async function searchInspectionService(id, role, text, status) {
  if (status === InspectionStatus.COMPLETED) {

    const regex = new RegExp(text, "ig");

    const data = await Inspection.aggregate([
      {
        $match: {
          "RenterDetails.id": id,
          status: InspectionStatus.COMPLETED,
          $or: [
            { propertyName: { $regex: regex } },
            { landlordName: { $regex: regex } },
            { addressText: { $regex: regex } },
          ]
        }
      }
    ]);

    // console.log(data, "==d=dyaaaadtaa ")

    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };


  } else if (status === "pending") {

    const regex = new RegExp(text, "ig");

    const data = await Inspection.aggregate([
      {
        $match: {
          "RenterDetails.id": id,
          status: InspectionStatus.INITIATED,
          $or: [
            { propertyName: { $regex: regex } },
            { landlordName: { $regex: regex } },
            { addressText: { $regex: regex } },
          ]
        }
      }
    ]);

    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };

  } else if (status === "upcoming") {

    const regex = new RegExp(text, "ig");

    const data = await Inspection.aggregate([
      {
        $match: {
          "RenterDetails.id": id,
          status: InspectionStatus.INITIATED,
          $or: [
            { propertyName: { $regex: regex } },
            { landlordName: { $regex: regex } },
            { addressText: { $regex: regex } },
          ]
        }
      }
    ]);

    // console.log(data, "==d=dyaaaadtaa ")

    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };

  }
}

export {
  createInspection,
  fetchInspections,
  updateInspectionStatus,
  inspectionEditService,
  getAvailableDatesService,
  getInspectionsByUserID,
  searchInspectionService
};
