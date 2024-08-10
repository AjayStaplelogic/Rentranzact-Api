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
  leavePropertyService
} from "../services/property.service.mjs";
import { Property } from "../models/property.model.mjs";


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
    id
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

  const id = req.user.data._id;

  const { nearByProperty } = body;

  if (nearByProperty) {

    const data = await nearbyProperies(body, id);


    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  } else {
    const data = await filterProperies(body, id);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}

async function propertyByID(req, res) {
  const { id } = req.params;
  const { _id } = req.user.data;

  const data = await getPropertyByID(id, _id);

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
    let { category, type, min_availability, min_rent, max_rent, min_rooms, max_rooms, latitude, longitude, radius, search, furnishingType, communityType, city, sortBy } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let query = {};
    let query2 = {};
    if (category) { query.category = { $in: category.split(",") } };
    if (type) { query.type = { $in: type.split(",") } };
    if (Number(min_availability) > 0) {
      query.availability = { $lt: Number(min_availability) }
    } else if (min_availability == "0") {
      query.availability = { $lte: 0 }
    }

    if (!radius) {
      radius = 1000;    // 1000 miles
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

    if (furnishingType) { query.furnishingType = furnishingType; };
    if (communityType) { query.communityType = communityType; };
    if (city) { query.city = city; };

    let skip = Number(page - 1) * count;
    if (search) {
      query2.$or = [
        { landmark: { $regex: search, $options: 'i' } },
      ]
    }
    let field = "createdAt";
    let order = "desc";
    let sort_query = {};
    if (sortBy) {
      field = sortBy.split(' ')[0];
      order = sortBy.split(' ')[1];
    }
    sort_query[field] = order == "desc" ? -1 : 1;
    let pipeline = [
      {
        $match: query
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
          dist  : "$dist",
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

    ]

    if (longitude && longitude) {
      pipeline.unshift({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
          distanceField: "dist.calculated",
          maxDistance: Number(radius) * 1609.34,    // Converting in miles
          spherical: true,
        }
      })
    }
    console.log(pipeline, '====pipeline')
    let get_properties = await Property.aggregate(pipeline);
    return sendResponse(res, get_properties, "success", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

export {
  addProperty,
  searchProperty,
  propertiesList,
  propertyByID,
  addFavorite,
  searchPropertyByKeywords,
  myProperties,
  leaveProperty,
  getAllProperties
};
