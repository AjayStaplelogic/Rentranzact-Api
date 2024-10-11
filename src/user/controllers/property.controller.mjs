import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import {
  addPropertyService,
  searchInProperty,
  filterProperies,
  nearbyProperies,
  getPropertyByID,
  addFavoriteProperties,
  searchPropertyByString,
  getMyProperties,
  leavePropertyService,
  deletePropertyService
} from "../services/property.service.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

async function addProperty(req, res) {
  const { body } = req;

  // console.log(body , "body in add propertyyyyyy")

  const id = req.user.data._id;


  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const images = files.filter((file) => file.mimetype.startsWith("image/"));
  const documents = files.filter((file) => file.mimetype === "application/pdf");



  if (images.length > 0) {
    // console.log("Images uploaded:");

    images.forEach((image) => {

    });
  }

  if (documents.length > 0) {
    // console.log("Documents uploaded:");
    documents.forEach((document) => {

    });
  }

  const data = await addPropertyService(
    req.PropertyID,
    req.images,
    req.documents,
    req.videos,
    body,
    id,
    req
  );

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function searchProperty(req, res) {
  const { body } = req;

  const data = await searchInProperty(body);
  console.log(data, '=======data')
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function propertiesList(req, res) {
  const { body } = req;


  // const id = req.user.data._id;

  const { nearByProperty, userID, } = body;

  if (nearByProperty) {

    const data = await nearbyProperies(body, userID);


    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  } else {
    const data = await filterProperies(body, userID);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}

async function propertyByID(req, res) {
  const { id } = req.params;
  // const { _id } = req.user.data;
  const { userID } = req.query;

  const data = await getPropertyByID(id, userID);

  sendResponse(res, data?.data, data.message, data.status, data.statusCode);
}

async function deleteProperty(req, res) {

  const { id } = req.params;
  const { _id } = req.user.data;

  const data = await deletePropertyService(_id, id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addFavorite(req, res) {
  const { id } = req.params;

  // console.log(id, "this is property which liked or dislikeddddd")
  const { _id } = req.user.data;

  const data = await addFavoriteProperties(id, _id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function searchPropertyByKeywords(req, res) {
  const { search } = req.query;
  const { _id } = req.user.data;


  const data = await searchPropertyByString(search, _id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function myProperties(req, res) {
  // console.log(`[My Properties API]`)
  const { role, _id } = req.user.data;


  const data = await getMyProperties(role, _id, req);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function leaveProperty(req, res) {

  const userID = req.user.data._id;

  const propertyID = req.params.id;


  const data = await leavePropertyService(userID, propertyID)

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getAllProperties(req, res) {
  try {
    let {
      category,
      type,
      min_availability,
      max_availability,
      min_rent,
      max_rent,
      min_rooms,
      max_rooms,
      latitude,
      longitude,
      radius,
      search,
      furnishingType,
      communityType,
      city,
      user_id,
      approval_status,
      inDemand
    } = req.query;
    const page = Number(req.query.page || 1);
    const count = Number(req.query.count || 20);
    const sort_key = req.query.sort_key || "createdAt";
    const sort_order = req.query.sort_order || "desc";

    let query = {};
    let query2 = {};
    if (category) { query.category = { $in: category.split(",") } };
    if (type) { query.type = { $in: type.split(",") } };
    if (Number(max_availability) > 0) {
      query.availability = { $lt: Number(max_availability) }
    } else if (max_availability == "0") {
      query.availability = { $lte: 0 }
    }

    if (Number(min_availability) > 0) {
      query.availability = { $gt: Number(min_availability) }
    }

    if (!radius) {
      radius = 125;    // 125 miles, approx 200 kilometers
    }
    if (min_rent && max_rent) {
      query.rent = { $gte: Number(min_rent), $lte: Number(max_rent) }
    }

    if (min_rooms && max_rooms) {
      query.number_of_rooms = { $gte: Number(min_rooms), $lte: Number(max_rooms) }
    } else if (min_rooms && !max_rooms) {
      query.number_of_rooms = { $gte: Number(min_rooms) }
    } else if (!min_rooms && max_rooms) {
      query.number_of_rooms = { $lt: Number(max_rooms) }
    }

    if (furnishingType) { query.furnishingType = { $in: furnishingType.split(",") }; };
    if (communityType) { query.communityType = { $in: communityType.split(",") }; };
    if (city) { query.city = city; };

    let skip = Number(page - 1) * count;
    if (search) {
      query2.$or = [
        { propertyName: { $regex: search, $options: 'i' } },
      ]
    }

    let sort_query = {};
    sort_query[sort_key] = sort_order == "desc" ? -1 : 1;
    let favorite_arr = [];
    if (user_id) {
      let get_user = await User.findById(user_id);
      if (get_user) {
        favorite_arr = get_user.favorite;

        // If landlord or PM added property and switched his role to renter then don't show the properites to him that he added as landlord
        if (get_user.role === UserRoles.RENTER) {
          query.landlord_id = { $ne: `${get_user._id}` }
        }
      }
    }

    if (approval_status) {
      query.approval_status = { $in: approval_status.split(",") };
    }

    if (inDemand) {
      query.inDemand = inDemand == 'true' ? true : false;
    }
    let pipeline = [
      {
        $match: query
      },
      {
        $addFields: {
          string_property_id: {
            $toString: "$_id"
          }
        }
      },
      {
        $addFields: {
          liked: {
            $cond: {
              if: { $in: ["$string_property_id", favorite_arr] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          propertyID: "$propertyID",
          category: "$category",
          address: "$address",
          rent: "$rent",
          propertyName: "$propertyName",
          rentType: "$rentType",
          status: "$status",
          city: "$city",
          number_of_floors: "$number_of_floors",
          number_of_bathrooms: "$number_of_bathrooms",
          carpetArea: "$carpetArea",
          age_of_construction: "$age_of_construction",
          aboutProperty: "$aboutProperty",
          type: "$type",
          furnishingType: "$furnishingType",
          bedrooms: "$bedrooms",
          communityType: "$communityType",
          images: "$images",
          videos: "$videos",
          number_of_rooms: "$number_of_rooms",
          landlord_id: "$landlord_id",
          avg_rating: "$avg_rating",
          total_reviews: "$total_reviews",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          availability: "$availability",
          landmark: "$landmark",
          rented: "$rented",
          liked: "$liked"
          // dist  : "$dist",
        }
      },
      {
        $match: query2
      },
      {
        $facet: {
          pagination: [
            {
              $count: "total"
            },
            {
              $addFields: {
                page: Number(page)
              }
            }
          ],
          data: [
            {
              $sort: sort_query
            },
            {
              $skip: Number(skip)
            },
            {
              $limit: Number(count)
            },
          ],

        }
      }
    ];


    if (longitude && longitude) {
      pipeline.unshift({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
          distanceMultiplier: 1 / 1609.344,
          distanceField: "dist.calculated",
          maxDistance: Number(radius) * 1609.344,    // Converting in miles
        }
      })
    }
    // console.log(pipeline, '====pipeline')
    let get_properties = await Property.aggregate(pipeline);
    return sendResponse(res, get_properties, "success", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function getPropertyManagerList(req, res) {
  try {

    const sort_key = req.query.sort_key || "createdAt";
    const sort_order = req.query.sort_order || "desc";

    const sort_query = {};
    sort_query[sort_key] = sort_order == "desc" ? -1 : 1;
    const landlordID = req.user.data._id;

    const data = await Property.aggregate([
      {

        $match: {
          landlord_id: landlordID,
          property_manager_id: {   // Because some value in db are "" empty string and some are null
            $nin: ["", null]
          }
        }
      },
      {
        $group: {
          _id: "$property_manager_id",
        }
      },
      {
        // Convert the string propertyID to an ObjectId
        $addFields: {
          pm_id: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "pm_id",
          foreignField: "_id",
          as: "pm_info"

        }
      },
      {
        $project: {
          _id: 0,
          pmInfo: { $arrayElemAt: ["$pm_info", 0] },
        }
      },
      {
        $project: {
          id: "$pmInfo._id",
          email: "$pmInfo.email",
          name: "$pmInfo.fullName",
          countryCode: "$pmInfo.countryCode",
          phone: "$pmInfo.phone",
          pic: "$pmInfo.picture"
        }
      },
      {
        $sort: sort_query
      }
    ])

    return sendResponse(res, data, `list of property managers`, true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function getPropertyManagerDetails(req, res) {
  try {

    const id = req.params.id;

    const data = await User.findById(id).select('fullName role email verified countryCode phone picture')
    return sendResponse(res, data, `user detail`, true, 200);

  } catch (error) {
    return sendResponse(res, [], `${error}`, false, 500);
  }

}

async function getPropertyListByPmID(req, res) {

  try {
    const id = req.params.id;
    const data = await Property.find({ property_manager_id: id }).select('propertyName images address.addressText rent rentType avg_rating total_reviews rent_period_end rent_period_start lease_end_timestamp')

    return sendResponse(res, data, `property list for property manager`, true, 200);

  } catch (error) {
    return sendResponse(res, [], `${error}`, false, 500);
  }
}

async function teminatePM(req, res) {

  try {

    const id = req.params.id;

    const data = await Property.findByIdAndUpdate(id, { property_manager_id: null })

    return sendResponse(res, data, `teminated property manager successfully`, true, 200);

  } catch (error) {
    return sendResponse(res, [], `${error}`, false, 500);
  }


}

async function editProperty(req, res) {
  try {
    const { id, email } = req.body;
    const role = req?.user?.data?.role;
    const user_id = req?.user?.data?._id;

    if (!id) {
      return sendResponse(res, {}, 'id is required', false, 400);
    }

    console.log(req.body.images, '========req.body.images');
    console.log(req.images, '========req.images');
    console.log(req.files, '========req.files');


    if (req.files && req.files.length > 0) {
      req.body.images = req.body.images || [];
      req.body.documents = req.body.documents || [];

      if (req.images && req.images.length) {
        req.body.images = [...req.body.images, ...req.images];
      }

      if (req.documents && req.documents.length) {
        req.body.documents = [...req.body.documents, ...req.documents];
      }
    }

    let landlord_id = role === UserRoles.LANDLORD ? user_id : null;
    let property_manager_id = role === UserRoles.PROPERTY_MANAGER ? user_id : null;

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
        if (user.role === UserRoles.LANDLORD) {
          landlord_id = user._id;
        } else if (user.role === UserRoles.PROPERTY_MANAGER) {
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

    if (req.body.address) {
      req.body.address = JSON.parse(req.body.address);
    }

    if (req.body.amenities) {
      req.body.amenities = JSON.parse(req.body.amenities);
    }

    req.body.landlord_id = landlord_id;
    req.body.property_manager_id = property_manager_id ?? null;
    req.body.name = name;
    const property = await Property.findByIdAndUpdate(id, req.body, { new: true });
    if (property) {
      return sendResponse(res, property, 'property updated successfully', true, 200);
    }
    return sendResponse(res, null, "Invalid Id", false, 400);


  } catch (error) {
    console.log(error, '=====error')
    return sendResponse(res, [], error.message, false, 400)
  }
}

export {
  getPropertyListByPmID,
  addProperty,
  searchProperty,
  propertiesList,
  propertyByID,
  addFavorite,
  searchPropertyByKeywords,
  myProperties,
  leaveProperty,
  getAllProperties,
  deleteProperty,
  getPropertyManagerList,
  getPropertyManagerDetails,
  teminatePM,
  editProperty
};
