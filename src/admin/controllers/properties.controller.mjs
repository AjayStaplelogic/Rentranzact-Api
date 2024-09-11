import { sendResponse } from "../helpers/sendResponse.mjs";
import { getPropertiesList, getPropertyByID, deletePropertyByID, leaseAggrementsList } from "../services/properties.service.mjs";
import { Property } from "../../user/models/property.model.mjs"

async function properties(req, res) {

  const data = await getPropertiesList();

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function leaseAggrements(req, res) {

  const { filters } = req.query;

  const data = await leaseAggrementsList(filters);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function property(req, res) {

  const { id } = req.params;

  // console.log(id, "-----did")

  const data = await getPropertyByID(id);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function deleteProperty(req, res) {
  const { id } = req.params;

  const data = await deletePropertyByID(id);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );

}

async function updateProperty(req, res) {
  try {
    console.log(req.body, '======Update Property')
    let { id } = req.body;
    if (!id) {
      return sendResponse(res, {}, "Id required", false, 400);
    }

    let update_property = await Property.findByIdAndUpdate(id, req.body, { new: true });
    if (update_property) {
      return sendResponse(res, update_property, "success", true, 200);
    }
    return sendResponse(res, {}, "Invalid Id", false, 400);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function getAllPropertyList(req, res) {
  try {
    console.log(`[Admin Property List]`)
    let { category, type, latitude, longitude, radius, search, city, sortBy, rented } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let query = {};
    let query2 = {};
    if (category) { query.category = { $in: category.split(",") } };
    if (type) { query.type = { $in: type.split(",") } };
    if (!radius) {
      radius = 125;    // 125 miles
    }

    if (rented) {
      query["rented"] = rented === "true" ? true : false;
    }
  
    if (city) { query.city = city; };

    let skip = Number(page - 1) * count;
    if (search) {
      query2.$or = [
        { propertyName: { $regex: search, $options: 'i' } },
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
        $set: {
          landlord_id : {$toObjectId : "$landlord_id"},
          property_manager_id : {$toObjectId : "$property_manager_id"},
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "landlord_id",
          foreignField: "_id",
          as: "landlord_details"
        }
      },
      {
        $unwind: {
          path: "$landlord_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "property_manager_id",
          foreignField: "_id",
          as: "property_mananger_details"
        }
      },
      {
        $unwind: {
          path: "$property_mananger_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          propertyID: "$propertyID",
          category: "$category",
          address: "$address",
          rent: "$rent",
          propertyName: "$propertyName",
          status: "$status",
          city: "$city",
          type: "$type",
          rented : "$rented",
          images: "$images",
          landlord_id: "$landlord_id",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          availability: "$availability",
          landlord_name: "$landlord_details.fullName",
          landloard_image: "$landlord_details.picture",
          landloard_phone: "$landlord_details.phone",
          property_mananger_name: "$property_mananger_details.fullName",
          property_mananger_image: "$property_mananger_details.picture",
          property_mananger_phone: "$property_mananger_details.phone",
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
          distanceMultiplier: 1 / 1609.344,
          distanceField: "dist.calculated",
          maxDistance: Number(radius) * 1609.344,    // Converting in miles
        }
      })
    }
    
    let get_properties = await Property.aggregate(pipeline);
    let additional_data = {
      pageNo : page,
      pageSize : count,
    };
    console.log(get_properties[0].pagination)
    if(get_properties && get_properties.length > 0) {
        if( get_properties[0].pagination &&  get_properties[0].pagination.length){
          additional_data.count = get_properties[0]?.pagination[0]?.total;
        }
    }
    return sendResponse(res, get_properties[0].data, "success", true, 200, {}, additional_data);
  } catch (error) {
    console.log(error)
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

export {
  properties,
  property,
  deleteProperty,
  leaseAggrements,
  updateProperty,
  getAllPropertyList
}