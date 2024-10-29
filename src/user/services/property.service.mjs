import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { Inspection } from "../models/inspection.model.mjs"
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { ApprovalStatus, RentBreakDownPer } from "../enums/property.enums.mjs"
import { InspectionStatus } from "../enums/inspection.enums.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { getAdmins } from "../services/user.service.mjs"
import { Notification } from "../models/notification.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import { Admin } from "../../admin/models/admin.model.mjs";



async function addPropertyService(
  PropertyID,
  images,
  documents,
  videos,
  body,
  id,
  req
) {

  // console.log(`[Add PropertyService]`)
  let { email } = body;
  const role = req?.user?.data?.role;
  let trimmedStr = body.amenities.slice(1, -1); // Removes the first and last character (quotes)

  let arr = JSON.parse("[" + trimmedStr + "]");
  let landlord_id = role === UserRoles.LANDLORD ? id : null;
  let property_manager_id = role === UserRoles.PROPERTY_MANAGER ? id : null;

  let name = "";
  if (email) {
    let user = await User.findOne({
      email: email.toLowerCase().trim(),
      deleted: false,
      role: {
        $in: [UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER],
      },
    }).lean().exec();
    if (user) {
      name = user.fullName;
      if (user.role === UserRoles.LANDLORD && role === UserRoles.PROPERTY_MANAGER) {   // If property is added by property manager, checking email key if it is landlord then adding it as landlord
        landlord_id = user._id;
      } else if (user.role === UserRoles.PROPERTY_MANAGER && role === UserRoles.LANDLORD) {  // If property is added by landlord, checking email key if it is property manager then adding it as property manager
        property_manager_id = user._id;
      }
    } else {
      return {
        data: [],
        message: "email of property manager or landlord is not valid",
        status: false,
        statusCode: 403,
      };
    }
  }

  const Property_ = {
    propertyID: PropertyID,
    images: images,
    documents: documents,
    videos: videos,
    category: body.category,
    address: JSON.parse(body.address),
    rent: Number(body.rent),
    propertyName: body.propertyName,
    email: email.toLowerCase().trim(),
    name: name,
    rentType: body.rentType,
    city: body.city || "",
    carpetArea: Number(body.carpetArea) || 0,
    age_of_construction: body.age_of_construction,
    aboutProperty: body.aboutProperty,
    type: body.type,
    furnishingType: body.furnishingType,
    landmark: body.landmark || "",
    superArea: body.superArea || "",
    availability: Number(body.availability),
    communityType: body.communityType || "",
    landlord_id: landlord_id,
    property_manager_id: property_manager_id ?? null,
    servicesCharges: Number(body.servicesCharges) || 0,
    amenities: arr,
    number_of_rooms: Number(body.number_of_rooms) || 0,
    postedByAdmin: body.postedByAdmin,
    building_number: body.building_number || "",
    street_name: body.street_name || "",
    estate_name: body.estate_name || "",
    state: body.state || "",
    country: body.country || "",
    servicing: body.servicing || "",
    total_space_for_rent: body.total_space_for_rent || 0,
    total_administrative_offices: body.total_administrative_offices || 0,
    is_legal_partner: body.is_legal_partner || false,
    serviceChargeDuration: body.serviceChargeDuration || ""
  };

  if (body.type != "Open Space") {
    Property_["bedrooms"] = body.bedrooms
    Property_["number_of_floors"] = body.number_of_floors
    Property_["number_of_bathrooms"] = body.number_of_bathrooms
  }

  const property = await Property.create(Property_);
  // console.log(`[Property Created]`);
  if (property) {

    // Sending notification to admin for approval
    // const admins = await getAdmins();
    Admin.find({ role: "superAdmin" }).then((admins) => {
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          const notification_payload = {};
          notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
          notification_payload.notificationHeading = "New Property Added";
          notification_payload.notificationBody = `${req?.user?.data?.fullName ?? ""} added a new property`;
          notification_payload.landlordID = property.landlord_id;
          notification_payload.propertyID = property._id;
          notification_payload.send_to = admin._id;
          notification_payload.property_manager_id = property.property_manager_id;
          notification_payload.is_send_to_admin = true;
          Notification.create(notification_payload).then((create_notification) => {
            if (create_notification) {
              if (create_notification) {
                if (admin && admin.fcmToken) {
                  const metadata = {
                    "propertyID": property._id.toString(),
                    "redirectTo": "property",
                  }
                  sendNotification(admin, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, admin.role)
                }
              }
            }
          });
        }
      }
    })
    // console.log(`[Property Created][Finished]`);

    return {
      data: property,
      message: "property created successfully",
      status: true,
      statusCode: 201,
    };
  }

  return {
    data: [],
    message: "Unable to add property",
    status: false,
    statusCode: 400,
  };
}

async function searchInProperty(body) {
  let { longitude, latitude, type, budget, maxDistance, approval_status } = body;

  if (!longitude || !latitude) {
    return "Longitude and latitude are required";
  }

  if (!maxDistance) {
    maxDistance = 500
  }

  try {
    const query = {
      "address.coordinates": {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)],
            maxDistance / 3963.2, // Convert distance to radians (Earth's radius in miles)
          ],
        },
      },
    };

    if (budget && budget.min !== undefined) {
      query.rent = { $gte: budget.min };
    }

    if (budget && budget.max !== undefined) {
      if (!query.rent) query.rent = {};
      query.rent.$lte = budget.max;
    }

    if (type) {
      query.type = type;
    }

    if (approval_status) {
      query.approval_status = { $in: approval_status.split(",") };
    }

    const properties = await Property.find(query);

    return {
      data: properties,
      message: "property search results successfully",
      status: true,
      statusCode: 200,
    };
  } catch (error) {
    console.log(error);
    // res.status(500).send("Error searching for properties: " + error.message);
  }
}

async function filterProperies(body, id) {
  const { filters, approval_status, rented } = body;
  const sort_key = body.sort_key || "createdAt";
  const sort_order = body.sort_order || "desc";
  let sort_query = {};
  sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

  if (approval_status) {
    filters.approval_status = { $in: approval_status.split(",") };
  }

  if (rented) {
    filters.rented = rented === 'true' ? true : false;
  }

  let favorite_arr = [];
  if (id) {
    let get_user = await User.findById(id);
    if (get_user) {
      favorite_arr = get_user.favorite;

      // If landlord or PM added property and switched his role to renter then don't show the properites to him that he added as landlord
      if (get_user.role === UserRoles.RENTER) {
        filters.landlord_id = { $ne: `${get_user._id}` }
      }
    }
  }

  const data = await Property.find(filters).sort(sort_query)
  let modifiedProperties = data;
  if (id) {
    // const favorite = await User.findById(id).select("favorite")
    if (favorite_arr && favorite_arr.length > 0) {
      modifiedProperties = data?.map(property => {
        const liked = favorite_arr.includes(property._id);
        return { ...property.toObject(), liked };
      });
    }
  }

  return {
    data: modifiedProperties,
    message: "Search Results",
    status: true,
    statusCode: 200,
  };
}

async function nearbyProperies(body, userID) {
  let { maxDistance, latitude, longitude, approval_status, rented } = body;
  const sort_key = body.sort_key || "createdAt";
  const sort_order = body.sort_order || "desc";
  let sort_query = {};
  sort_query[sort_key] = sort_order == "desc" ? -1 : 1;
  if (!maxDistance) {
    maxDistance = 125;
  }

  if (maxDistance && latitude && longitude) {
    let query = {
      "address.coordinates": {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            maxDistance / 3963.2, // Convert distance to radians (Earth's radius in miles)
          ],
        },
      },
      approval_status: { $in: approval_status?.split(",") ?? [ApprovalStatus.ACCEPTED] }
    };

    if (userID) {
      query.landlord_id = { $ne: userID }
    }

    if (rented) {
      query.rented = rented === 'true' ? true : false;
    }

    console.log(query, '====query')

    const data = await Property.find(query).sort(sort_query);

    let modifiedProperties = data;


    if (userID) {
      const favorite = await User.findById(userID).select("favorite")
      if (favorite) {
        modifiedProperties = data.map(property => {

          const liked = favorite?.favorite.includes(property._id);

          return { ...property.toObject(), liked };
        });
      }
    }

    return {
      data: modifiedProperties,
      message: "Nearby Property listing",
      status: true,
      statusCode: 200,
    };
  } else {
    console.log("HERE")
    let query = {
      approval_status: { $in: approval_status?.split(",") ?? [ApprovalStatus.ACCEPTED] }
    }

    if (userID) {
      query.landlord_id = { $ne: userID }
    }

    if (rented) {
      query.rented = rented === 'true' ? true : false;
    }

    const data = await Property.find(query).limit(9);
    let modifiedProperties = data
    if (userID) {
      const favorite = await User.findById(userID).select("favorite")
      if (favorite) {
        modifiedProperties = data.map(property => {

          const liked = favorite?.favorite.includes(property._id);

          return { ...property.toObject(), liked };
        });
      }
    }
    return {
      data: modifiedProperties,
      message: "Property listing",
      status: true,
      statusCode: 200,
    };
  }
}

async function getPropertyByID(id, userID) {
  const data = await Property.findById(id);

  // console.log(data, "----dataa of property")
  const dataMerge = {};

  dataMerge.rental_breakdown = {
    service_charge: 0,
    rent: 0,
    insurance: 0,
    agency_fee: 0,
    legal_Fee: 0,
    caution_deposite: 0,
    total_amount: 0
  }

  if (data.servicesCharges > 0) {
    dataMerge.rental_breakdown.service_charge = data.servicesCharges;
  }
  if (data.rent > 0) {
    dataMerge.rental_breakdown.rent = data.rent;
    let rent = Number(data.rent);
    dataMerge.rental_breakdown.agency_fee = (rent * RentBreakDownPer.AGENCY_FEE) / 100;
    dataMerge.rental_breakdown.legal_Fee = (rent * RentBreakDownPer.LEGAL_FEE_PERCENT) / 100;
    dataMerge.rental_breakdown.caution_deposite = (rent * RentBreakDownPer.CAUTION_FEE_PERCENT) / 100;
    dataMerge.rental_breakdown.insurance = 0;    // variable declaration for future use
    dataMerge.rental_breakdown.total_amount = rent + dataMerge.rental_breakdown.insurance + dataMerge.rental_breakdown.agency_fee + dataMerge.rental_breakdown.legal_Fee + dataMerge.rental_breakdown.caution_deposite;
  }

  dataMerge.propertyData = data;

  // IF property have landlord then sending landlord details
  if (data.landlord_id) {
    const landlord = await User.findById(data.landlord_id);
    if (landlord) {
      const { _id, fullName, picture, verified, role, countryCode, phone } = landlord;

      dataMerge.landlord = {
        _id,
        fullName,
        picture,
        verified,
        role,
        countryCode,
        phone
      };
    }
  }

  // If property is on rent, then sending renter details
  if (data.rented) {
    const renter = await User.findById(data.renterID);
    const { _id, fullName, picture, verified, role, countryCode, phone } = renter;

    dataMerge.renterInfo = {
      _id,
      fullName,
      picture,
      verified,
      role,
      countryCode,
      phone
    }
  }

  // If property have property manager then sending property manager details
  if (data.property_manager_id) {
    const propertyManager = await User.findById(data.property_manager_id);
    const { _id, fullName, picture, verified, role, countryCode, phone } = propertyManager;
    dataMerge.property_manager = {
      _id,
      fullName,
      picture,
      verified,
      role,
      countryCode,
      phone
    };
  }

  if (userID) {
    const favorite = await User.findById(userID).select("favorite")
    if (favorite && favorite?.favorite?.includes(userID)) {
      dataMerge["liked"] = true
    } else {
      dataMerge["liked"] = false
    }
  }

  dataMerge.inspection_count = await Inspection.countDocuments({ propertyID: id, inspectionStatus: "initiated" });
  dataMerge.application_count = await rentApplication.countDocuments({ propertyID: id, applicationStatus: RentApplicationStatus.PENDING, }); // kinIdentityCheck: true , removed this check because kin verification functionality no longer exists
  return {
    data: dataMerge,
    message: "Nearby Property listing",
    status: true,
    statusCode: 200,
  };
}

async function addFavoriteProperties(propertyID, renterID) {

  // console.log(propertyID, renterID, "===== propety ID renter ID")
  const favorite = await User.findOne({ _id: renterID, favorite: propertyID });

  const isFavorite = favorite !== null;


  if (isFavorite) {
    const data = await User.findByIdAndUpdate(
      renterID,
      { $pull: { favorite: propertyID } },
      { new: true }
    );

    return {
      data: data,
      message: "Property unfavorite successfully",
      status: true,
      statusCode: 200,
    };
  } else {

    const data = await User.findByIdAndUpdate(
      renterID,
      { $push: { favorite: propertyID } },
      { new: true }
    );
    // console.log(data, "")
    return {
      data: data,
      message: "Property favorite successfully",
      status: true,
      statusCode: 200,
    };
  }
}

async function searchPropertyByString(search, userID) {
  const query = {
    $or: [
      { propertyName: { $regex: new RegExp(search, "i") } }, // Case-insensitive regex search for name
      { city: { $regex: new RegExp(search, "i") } }, // Case-insensitive regex search for city
    ],
  };


  const results = await Property.find(query);

  const favorite = await User.findById(userID).select("favorite")

  const modifiedProperties = results?.map(property => {

    // console.log(property, "===========propertyyyyy")

    const liked = favorite?.favorite.includes(property._id);

    // console.log(property._id, "===========propertyyyyy id")

    return { ...property.toObject(), liked };
  });




  return {
    data: modifiedProperties,
    message: "Search found",
    status: true,
    statusCode: 200,
  };
}

async function getMyProperties(role, id, req) {

  let { rented, city, type, search } = req.query;
  let query = {}

  if (rented) {
    query["rented"] = rented === "true" ? true : false;
  }

  if (city) {
    query["city"] = city;
  }
  if (type) {
    query["type"] = type;
  }
  if (search) {
    query = {
      $or: [
        { propertyName: { $regex: search, $options: "i" } },
      ],
    };
  }

  if (req?.user?.data?.role == UserRoles.LANDLORD) {
    query["landlord_id"] = id;
  }

  if (req?.user?.data?.role == UserRoles.PROPERTY_MANAGER) {
    query["property_manager_id"] = id;
  }

  if (req?.user?.data?.role == UserRoles.RENTER) {
    query["renterID"] = id;
  }

  let data;
  if (role === UserRoles.RENTER) {

    data = await Property.find({ renterID: id });
    data = await Property.aggregate([
      {
        $match: query
      },
      {
        $set: {
          landlord_id: {
            $toObjectId: "$landlord_id"
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "landlord_id",
          foreignField: "_id",
          as: "landlordDetails",
        }
      },
      {
        $unwind: {
          path: "$landlordDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          landlord_name: "$landlordDetails.fullName",
          landlord_picture: "$landlordDetails.picture",
        }
      },
      {
        $unset: ["landlordDetails"]
      }
    ]);

  } else if (role === UserRoles.LANDLORD) {


    data = await Property.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "rentapplications",
          let: { propertyId: { $toObjectId: "$_id" } }, // Convert _id from Property to ObjectId
          pipeline: [
            {
              $addFields: {
                propertyIDObjectId: { $toObjectId: "$propertyID" } // Convert propertyID to ObjectId
              }
            },
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } },
                  { applicationStatus: { $eq: RentApplicationStatus.PENDING } },
                  // { kinIdentityCheck: { $eq: true } }      // Commented this code because kin verification functionaliy no longer exists
                ]
              }
            },
            {
              $count: "applicationCount"
            }
          ],
          as: "propertyApplication"
        }
      },
      {
        $lookup: {
          from: "inspections",
          let: { propertyId: { $toObjectId: "$_id" } }, // Convert _id from Property to ObjectId
          pipeline: [
            {
              $addFields: {
                propertyIDObjectId: { $toObjectId: "$propertyID" } // Convert propertyID to ObjectId
              }
            },
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } },
                  { inspectionStatus: { $eq: "initiated" } },
                ]
              }
            },
            {
              $count: "inspectionCount"
            }
          ],
          as: "inspectionRequest"
        }
      },
      {
        $addFields: {
          applicationCount: { $arrayElemAt: ["$propertyApplication.applicationCount", 0] },
          inspectionCount: { $arrayElemAt: ["$inspectionRequest.inspectionCount", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          applicationCount: 1,
          inspectionCount: 1,
          address: 1,
          propertyName: 1,
          rent: 1,
          rentType: 1,
          images: 1,
          rented: "$rented",
          city: "$city",
          type: "$type",
          rent_period_due: 1,
          approval_status: "$approval_status",
          avg_rating: "$avg_rating",
          total_reviews: "$total_reviews",
        }
      }
    ]);
  } else if (role === UserRoles.PROPERTY_MANAGER) {
    console.log(query, '=====query');
    data = await Property.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "rentapplications",
          let: { propertyId: { $toObjectId: "$_id" } }, // Convert _id from Property to ObjectId
          pipeline: [
            {
              $addFields: {
                propertyIDObjectId: { $toObjectId: "$propertyID" } // Convert propertyID to ObjectId
              }
            },
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } },
                  { applicationStatus: { $eq: RentApplicationStatus.PENDING } },
                  // { kinIdentityCheck: { $eq: true } }
                ]
              }
            },
            {
              $count: "applicationCount"
            }
          ],
          as: "propertyApplication"
        }
      },
      {
        $lookup: {
          from: "inspections",
          let: { propertyId: { $toObjectId: "$_id" } }, // Convert _id from Property to ObjectId
          pipeline: [
            {
              $addFields: {
                propertyIDObjectId: { $toObjectId: "$propertyID" } // Convert propertyID to ObjectId
              }
            },
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } },
                  { inspectionStatus: { $eq: "initiated" } },
                ]
              }
            },
            {
              $count: "inspectionCount"
            }
          ],
          as: "inspectionRequest"
        }
      },
      {
        $addFields: {
          applicationCount: { $arrayElemAt: ["$propertyApplication.applicationCount", 0] },
          inspectionCount: { $arrayElemAt: ["$inspectionRequest.inspectionCount", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          applicationCount: 1,
          inspectionCount: 1,
          address: 1,
          propertyName: 1,
          rent: 1,
          rentType: 1,
          images: 1,
          rented: "$rented",
          city: "$city",
          type: "$type",
          approval_status: "$approval_status",
          avg_rating: "$avg_rating",
          total_reviews: "$total_reviews",
        }
      }
    ]);

  }

  return {
    data: data,
    message: "Search found",
    status: true,
    statusCode: 200,
  };

}

async function leavePropertyService(userID, propertyID) {

  console.log(propertyID, "--=-=-=-=")

  const data = await Property.findByIdAndUpdate(propertyID, {
    renterID: null,
    rented: false,
    rent_period_start: "",
    rent_period_end: "",
    payment_count: 0
  })

  return {
    data: data,
    message: "left property",
    status: true,
    statusCode: 200,
  };

}

async function deletePropertyService(userID, propertyID) {

  const data = await Inspection.find({
    landlordID: userID,
    inspectionStatus: InspectionStatus.ACCEPTED,
    propertyID: propertyID
  });
  console.log(data.length, "-----data")

  if (data.length !== 0) {
    return {
      data: [],
      message: "Unable To Delete Property",
      status: false,
      statusCode: 400,
    };

  } else {

    const data = await Property.findByIdAndDelete(propertyID);

    await Inspection.deleteMany({ landlordID: userID })

    return {
      data: data,
      message: "Property Deleted Successfully",
      status: true,
      statusCode: 200,
    };

  }





}


const notification_payload = {};
notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
notification_payload.notificationHeading = "111111New Property Added";
notification_payload.notificationBody = `added a new property`;
notification_payload.landlordID = "66a21b414ee1be84903a0076";
notification_payload.propertyID = "66a21b414ee1be84903a0076";
notification_payload.send_to = "66a21b414ee1be84903a0076";
notification_payload.property_manager_id = "66a21b414ee1be84903a0076";
notification_payload.is_send_to_admin = true;
// Notification.create(notification_payload).then((create_notification)=>{
//   console.log(create_notification)
// });

export {
  deletePropertyService,
  getMyProperties,
  addPropertyService,
  searchInProperty,
  filterProperies,
  nearbyProperies,
  getPropertyByID,
  addFavoriteProperties,
  searchPropertyByString,
  leavePropertyService
};
