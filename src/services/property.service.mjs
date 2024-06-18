import mongoose from "mongoose";
import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";


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

  console.log(role, email);

  console.log(propertyPostedBy, "---property posted by");

  // console.log(role === UserRoles.PROPERTY_MANAGER ? propertyPostedBy._id : id);

  if (propertyPostedBy) {
    const Property_ = {
      rentFrequency: body.rentFrequency,
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
      bedrooms: body.bedrooms,
      rentType: body.rentType,
      city: body.city,
      number_of_floors: parseInt(body.number_of_floors),
      number_of_bathrooms: parseInt(body.number_of_bathrooms),
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
      cautionDeposite: parseInt(body.cautionDeposite),
      servicesCharges: parseInt(body.servicesCharges),
      amenities: parseInt(body.amenities),
      number_of_rooms: body.number_of_rooms,
    };

    console.log(Property_, "======Property_");

    const property = new Property(Property_);
    property.save();

    return {
      data: property,
      message: "property created successfully",
      status: true,
      statusCode: 201,
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

async function filterProperies(body) {
  const { filters } = body;

  const data = await Property.find(filters);

  return {
    data: data,
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

async function getPropertyByID(id) {
  const data = await Property.findById(id);

  const dataMerge = {};

  if (data.landlord_id) {
    const landlord = await User.findById(data.landlord_id);

    dataMerge.propertyData = data;

    const { fullName, picture, verified, role } = landlord;

    dataMerge.landlord = {
      fullName,
      picture,
      verified,
      role,
    };
  } else {
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
    return {
      data: data,
      message: "Property favorite successfully",
      status: true,
      statusCode: 200,
    };
  }
}

export {
  addPropertyService,
  searchInProperty,
  filterProperies,
  nearbyProperies,
  getPropertyByID,
  addFavoriteProperties,
};
