import mongoose from "mongoose";
import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { Inspection } from "../models/inspection.model.mjs"
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";

async function addPropertyService(
  PropertyID,
  images,
  documents,
  videos,
  body,
  id
) {
  const { email, role } = body;

  const propertyPostedBy = await User.findOne({ email: "akanke@gmail.com", role: UserRoles.PROPERTY_MANAGER });

  //const propertyPostedBy = await User.findOne({ email: "propertymanager@gmail.com", role: UserRoles.PROPERTY_MANAGER });
  // console.log(role === UserRoles.PROPERTY_MANAGER ? propertyPostedBy._id : id);

  console.log(propertyPostedBy, "-----property posedted by ")

  let trimmedStr = body.amenities.slice(1, -1); // Removes the first and last character (quotes)

  // Step 2: Parse the JSON string into a JavaScript array
  let arr = JSON.parse("[" + trimmedStr + "]");

  if (propertyPostedBy) {
    console.log("property [posedted by true")
    const Property_ = {
      propertyID: PropertyID,
      images: images,
      documents: documents,
      videos: videos,
      category: body.category,
      address: JSON.parse(body.address),
      rent: parseInt(body.rent),
      propertyName: body.propertyName,
      email: propertyPostedBy.email,
      name: propertyPostedBy.fullName,
      rentType: body.rentType,
      city: body.city,
      carpetArea: parseInt(body.carpetArea),
      age_of_construction: parseInt(body.age_of_construction),
      aboutProperty: body.aboutProperty,
      type: body.type,
      furnishingType: body.furnishingType,
      landmark: body.landmark,
      superArea: body.superArea,
      availability: parseInt(body.availability),
      communityType: body.communityType,
      landlord_id: role === UserRoles.LANDLORD ? propertyPostedBy.id : id,
      property_manager_id:
        role === UserRoles.PROPERTY_MANAGER ? propertyPostedBy._id : id,
      servicesCharges: parseInt(body.servicesCharges),
      amenities: arr,
      number_of_rooms: body.number_of_rooms,
      postedByAdmin: body.postedByAdmin
    };

    if (body.type != "Open Space") {
      Property_["bedrooms"] = body.bedrooms
      Property_["number_of_floors"] = body.number_of_floors
      Property_["number_of_bathrooms"] = body.number_of_bathrooms
    }

    const property = new Property(Property_);
    property.save();

    return {
      data: property,
      message: "property created successfully",
      status: true,
      statusCode: 201,
    };
  } else {
    return {
      data: [],
      message: "kindly give correct project manager or landlord email",
      status: false,
      statusCode: 403,
    };
  }
}

async function searchInProperty(body) {
  const { longitude, latitude, type, budget, maxDistance } = body;

  if (!longitude || !latitude) {
    return "Longitude and latitude are required";
  }

  try {
    const query = {
      "address.coordinates": {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
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
  const { filters } = body;

  const data = await Property.find(filters).sort({createdAt : 1})

  const favorite = await User.findById(id).select("favorite")

  console.log(favorite, "---=-=favrotie")

  const modifiedProperties = data.map(property => {

    const liked = favorite?.favorite.includes(property._id);


    console.log(liked, "---likedddddddd")


    return { ...property.toObject(), liked };
  });

  return {
    data: modifiedProperties,
    message: "Search Results",
    status: true,
    statusCode: 200,
  };

  // const jobs = await MongoPaging.find(this.db.models.Jobs, {
  //   query: filters,
  //   limit: payload.limit,
  //   paginatedField: payload.paginatedField,
  //   sortAscending: payload.sortAscending,
  //   next: payload.next,
  //   previous: payload.previous,
  // });
}

async function nearbyProperies(body) {
  const { maxDistance, latitude, longitude } = body;

  console.log(maxDistance, latitude, longitude, "=----body");

  if (maxDistance && latitude && longitude) {
    const data = await Property.find({
      "address.coordinates": {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            maxDistance / 3963.2, // Convert distance to radians (Earth's radius in miles)
          ],
        },
      },
    });

    return {
      data: data,
      message: "Nearby Property listing",
      status: true,
      statusCode: 200,
    };
  } else {
    const data = await Property.find().limit(9);
    return {
      data: data,
      message: "Property listing",
      status: true,
      statusCode: 200,
    };
  }
}

async function getPropertyByID(id, userID) {
  const data = await Property.findById(id);

  console.log(data, "----dataa of property")
  const dataMerge = {};

  if (data.landlord_id) {
    const favorite = await User.findById(userID).select("favorite")


    const landlord = await User.findById(data.landlord_id);

    dataMerge.propertyData = data;

    if (favorite.favorite.includes(id)) {

      dataMerge["liked"] = true

    } else {

      dataMerge["liked"] = false

    }

    console.log(dataMerge.propertyData, "==final ")
    const { fullName, picture, verified, role } = landlord;

    dataMerge.landlord = {
      fullName,
      picture,
      verified,
      role,
    };
  } else {


    const favorite = await User.findById(userID).select("favorite")

    console.log(favorite, "===================favroite", favorite.favorite.includes(id))

    if (favorite.favorite.includes(id)) {
      dataMerge["liked"] = true
    } else {
      dataMerge["liked"] = false
    }

    console.log(dataMerge, "----datam,ergherbrrbkjrbkjhrkjh")



    const propertyManager = await User.findById(data.property_manager_id);

    const { fullName, picture, verified, role } = propertyManager;

    dataMerge.property_manager = {
      fullName,
      picture,
      verified,
      role,
    };
  }

  return {
    data: dataMerge,
    message: "Nearby Property listing",
    status: true,
    statusCode: 200,
  };
}

async function addFavoriteProperties(propertyID, renterID) {
  const isFavorite = await User.findOne({ favorite: { $in: [propertyID] } });

  console.log(isFavorite, "====is Favrotiessss")

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
    console.log(data, "")
    return {
      data: data,
      message: "Property favorite successfully",
      status: true,
      statusCode: 200,
    };
  }
}

async function searchPropertyByString(search) {
  const query = {
    $or: [
      { propertyName: { $regex: new RegExp(search, "i") } }, // Case-insensitive regex search for name
      { city: { $regex: new RegExp(search, "i") } }, // Case-insensitive regex search for city
    ],
  };

  // Execute the query
  const results = await Property.find(query);

  console.log(results);

  return {
    data: results,
    message: "Search found",
    status: true,
    statusCode: 200,
  };
}

async function getMyProperties(role, id) {


  let data;
  if (role === UserRoles.RENTER) {

    data = await Property.find({ renterID: id });

  } else if (role === UserRoles.LANDLORD) {



    data = await Property.aggregate([
      {
        $match: {
          landlord_id: id,

        }
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
                  { kinIdentityCheck: { $eq: true } }
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
                  { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } }
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
          images: 1
        }
      }
    ]);


    console.log(data, "====dat=aa=a==a=a=")




  } else if (role === UserRoles.PROPERTY_MANAGER) {
    data = await Property.find({ property_manager_id: id });

  }

  return {
    data: data,
    message: "Search found",
    status: true,
    statusCode: 200,
  };

}

export {
  getMyProperties,
  addPropertyService,
  searchInProperty,
  filterProperies,
  nearbyProperies,
  getPropertyByID,
  addFavoriteProperties,
  searchPropertyByString,
};
