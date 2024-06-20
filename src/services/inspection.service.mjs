import { newsletter } from "../models/newsletter.model.mjs";
import { Inspection } from "../models/inspection.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { InspectionStatus } from "../enums/inspection.enums.mjs";
import moment from "moment";

async function createInspection(body, renterID) {
  const { propertyID, inspectionDate, inspectionTime } = body;

  const property = await Property.findById(propertyID);

  const renterDetails = await User.findById(renterID);

  const { fullName, picture, phone, countryCode } = renterDetails;

  body.renterID = renterID;

  body.RenterDetails = {
    id: renterID,
    fullName: fullName,
    picture: picture,
    countryCode: countryCode,
    phone: phone,
  };

  body.propertyName = property.name;

  console.log("property.landlord_id", property.landlord_id);

  body.landlordID = property.landlord_id;

  body.property_manager_id = property.property_manager_id;

  body.images = property.images;

  const data = new Inspection(body);
  data.save();

  console.log(inspectionDate);

  const formattedDate = moment(inspectionDate).format("DD MMMM");

  console.log(formattedDate, "formattedDate");

  data.messageDetails = {
    date: formattedDate,
    time: inspectionTime,
    propertyName: property.name,
  };

  return {
    data: data,
    message: "successfully booked inspection",
    status: true,
    statusCode: 201,
  };
}

async function fetchInspections(userData) {
  if (userData.role === UserRoles.LANDLORD) {
    const data = await Inspection.find({ landlordID: userData?._id });
    return {
      data: data,
      message: "inspection list fetched successfully",
      status: true,
      statusCode: 200,
    };
  } else if (userData.role === UserRoles.PROPERTY_MANAGER) {
    const data = await Inspection.find({ propertyID: userData?._id });
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

    console.log(data2, "dataaaaa2222");

    // Import ObjectId from MongoDB driver

    const data = await Inspection.aggregate([
      {
        $match: {
          "RenterDetails.id": userData?._id,
        },
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
            { $project: { images: 1 } }, // Project only the images array from properties
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
        },
      },
    ]);

    console.log(data, "========+++ dataaaaaa");

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

  if (InspectionStatus.CANCELED === status) {
    const data = await Inspection.findByIdAndUpdate(inspectionID, {
      inspectionStatus: status,
      canceledID: id,
      cancelReason: reason,
    });

    return {
      data: data,
      message: "inspection cancelled successfully",
      status: true,
      statusCode: 200,
    };
  } else if (InspectionStatus.COMPLETED === status) {
    const data = await Inspection.findByIdAndUpdate(inspectionID, {
      inspectionStatus: status,
      approverID: id,
    });

    return {
      data: data,
      message: "inspection completed successfully",
      status: true,
      statusCode: 200,
    };
  }
}

async function inspectionEditService(body) {
  const { inspectionID, inspectionTime, inspectionDate, message } = body;

  const data = await Inspection.findByIdAndUpdate(inspectionID, {
    inspectionTime: inspectionTime,
    inspectionDate: inspectionDate,
    message: message,
  });

  return {
    data: data,
    message: "inspection updated successfully",
    status: true,
    statusCode: 200,
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

export {
  createInspection,
  fetchInspections,
  updateInspectionStatus,
  inspectionEditService,
  getAvailableDatesService,
};
