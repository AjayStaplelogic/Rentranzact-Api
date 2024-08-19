import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { Inspection } from "../models/inspection.model.mjs"
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { RentBreakDownPer } from "../enums/property.enums.mjs"
import { InspectionStatus } from "../enums/inspection.enums.mjs";
import { rentApplication } from "../models/rentApplication.model.mjs";

async function addPropertyService(
  PropertyID,
  images,
  documents,
  videos,
  body,
  id
) {
  const { email, role } = body;

  const propertyPostedBy = await User.findOne({ email: email, role: role });

  let trimmedStr = body.amenities.slice(1, -1); // Removes the first and last character (quotes)

  let arr = JSON.parse("[" + trimmedStr + "]");

  if (propertyPostedBy) {
    // console.log("property [posedted by true")
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
      message: "email of property manager or landlord is not valid",
      status: false,
      statusCode: 403,
    };
  }
}

async function searchInProperty(body) {
  let { longitude, latitude, type, budget, maxDistance } = body;

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

  const data = await Property.find(filters).sort({ createdAt: -1 })
  const favorite = await User.findById(id).select("favorite")

  const modifiedProperties = data?.map(property => {

    // console.log(property, "===========propertyyyyy")

    const liked = favorite?.favorite.includes(property._id);

    // console.log(property._id, "===========propertyyyyy id")

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

async function nearbyProperies(body, userID) {
  const { maxDistance, latitude, longitude } = body;







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

    const favorite = await User.findById(userID).select("favorite")

    const modifiedProperties = data.map(property => {

      const liked = favorite?.favorite.includes(property._id);

      return { ...property.toObject(), liked };
    });




    return {
      data: modifiedProperties,
      message: "Nearby Property listing",
      status: true,
      statusCode: 200,
    };
  } else {

    const data = await Property.find().limit(9);
    const favorite = await User.findById(userID).select("favorite")

    const modifiedProperties = data.map(property => {

      const liked = favorite?.favorite.includes(property._id);

      return { ...property.toObject(), liked };
    });


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

  if (data.landlord_id) {
    const favorite = await User.findById(userID).select("favorite")


    const landlord = await User.findById(data.landlord_id);

    dataMerge.propertyData = data;

    if (favorite.favorite.includes(id)) {

      dataMerge["liked"] = true

    } else {

      dataMerge["liked"] = false

    }

    // console.log(dataMerge.propertyData, "==final ")
    const { fullName, picture, verified, role } = landlord;

    dataMerge.landlord = {
      fullName,
      picture,
      verified,
      role,
    };
  } else {


    const favorite = await User.findById(userID).select("favorite")

    // console.log(favorite, "===================favroite", favorite.favorite.includes(id))

    if (favorite.favorite.includes(id)) {
      dataMerge["liked"] = true
    } else {
      dataMerge["liked"] = false
    }

    // console.log(dataMerge, "----datam,ergherbrrbkjrbkjhrkjh")



    const propertyManager = await User.findById(data.property_manager_id);

    const { fullName, picture, verified, role } = propertyManager;

    dataMerge.property_manager = {
      fullName,
      picture,
      verified,
      role,
    };
  }


  if (data.rented) {
    const renter = await User.findById(data.renterID);

    console.log(renter, "=renterr")

    const { fullName, picture, verified, role } = renter;

    dataMerge.renterInfo = {
      fullName,
      picture,
      verified,
      role,
    }
  }

  dataMerge.inspection_count = await Inspection.countDocuments({ propertyID: id });
  dataMerge.application_count = await rentApplication.countDocuments({ propertyID: id });

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

  let data;
  if (role === UserRoles.RENTER) {

    data = await Property.find({ renterID: id });

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
          type: "$type"
        }
      }
    ]);
  } else if (role === UserRoles.PROPERTY_MANAGER) {
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

  const data = await Property.findByIdAndUpdate(propertyID, { renterID: "", rented: false, rent_period_start: "", rent_period_end: "" })

  return {
    data: data,
    message: "left property",
    status: true,
    statusCode: 200,
  };

}

async function deletePropertyService(userID, propertyID) {

  const data = await Inspection.find({ landlordID: userID, inspectionStatus: InspectionStatus.ACCEPTED });
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
