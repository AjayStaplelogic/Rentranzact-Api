import { sendResponse } from "../helpers/sendResponse.mjs";
import { getPropertiesList, getPropertyByID, deletePropertyByID, leaseAggrementsList } from "../services/properties.service.mjs";
import { Property } from "../../user/models/property.model.mjs"
import { User } from "../../user/models/user.model.mjs"
import * as propertyValidation from "../validations/property.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { ApprovalStatus } from "../../user/enums/property.enums.mjs"
import { Notification } from "../../user/models/notification.model.mjs";
import sendNotification from "../../user/helpers/sendNotification.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import { LeaseAggrements } from "../../user/models/leaseAggrements.model.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


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

  const data = await leaseAggrementsList(req);

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
    let {
      category,
      type,
      latitude,
      longitude,
      radius,
      search,
      city,
      sortBy,
      rented,
      inDemand,
      approval_status,
      renterID,
      landlord_id,
      property_manager_id,
    } = req.query;
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

    if (inDemand) {
      query["inDemand"] = inDemand === "true" ? true : false;
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

    if (approval_status) {
      query.approval_status = { $in: approval_status.split(',') };
    }

    if (renterID) {
      query.renterID = renterID;
    }

    if (landlord_id) {
      query.landlord_id = landlord_id;
    }

    if (property_manager_id) {
      query.property_manager_id = property_manager_id;
    }

    let pipeline = [
      {
        $match: query
      },
      {
        $set: {
          landlord_id: { $toObjectId: "$landlord_id" },
          property_manager_id: { $toObjectId: "$property_manager_id" },
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
          rented: "$rented",
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
          approval_status : "$approval_status"
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
      pageNo: page,
      pageSize: count,
    };
    console.log(get_properties[0].pagination)
    if (get_properties && get_properties.length > 0) {
      if (get_properties[0].pagination && get_properties[0].pagination.length) {
        additional_data.count = get_properties[0]?.pagination[0]?.total;
      }
    }
    return sendResponse(res, get_properties[0].data, "success", true, 200, {}, additional_data);
  } catch (error) {
    console.log(error)
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function editProperty(req, res) {
  try {
    const { id, email } = req.body;
    // const role = req?.user?.data?.role;
    // const user_id = req?.user?.data?._id;

    if (!id) {
      return sendResponse(res, {}, 'id is required', false, 400);
    }

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

    // let landlord_id = role === UserRoles.LANDLORD ? user_id : null;
    // let property_manager_id = role === UserRoles.PROPERTY_MANAGER ? user_id : null;

    // let name = "";
    // if (email) {
    //   let user = await User.findOne({
    //     email: email.toLowerCase().trim(),
    //     deleted: false,
    //     role: {
    //       $in: [UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER],
    //     },
    //   }).lean().exec();
    //   if (user) {
    //     name = user.fullName;
    //     if (user.role === UserRoles.LANDLORD) {
    //       landlord_id = user._id;
    //     } else if (user.role === UserRoles.PROPERTY_MANAGER) {
    //       property_manager_id = user._id;
    //     }
    //   } else {
    //     return {
    //       data: [],
    //       message: "email of property manager or landlord is not valid",
    //       status: false,
    //       statusCode: 403,
    //     };
    //   }
    // }

    if (req.body.address) {
      req.body.address = JSON.parse(req.body.address);
    }

    if (req.body.amenities) {
      req.body.amenities = JSON.parse(req.body.amenities);
    }

    // req.body.landlord_id = landlord_id;
    // req.body.property_manager_id = property_manager_id ?? null;
    // req.body.name = name;

    // Remove unnecessary fields before saving to database, admin cannot edit these details
    delete req.body.landlord_id;
    delete req.body.property_manager_id;
    delete req.body.name;
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

async function updatePropertyApprovalStatus(req, res) {
  try {

    const { isError, errors } = validator(req.body, propertyValidation.updatePropertyApprovalStatus);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    const { id, status } = req.body;

    if (!id || !status) {
      return sendResponse(res, {}, 'id and status are required', false, 400);
    }

    const property = await Property.findById(id);
    if (property) {
      if (property.approval_status === status) {
        return sendResponse(res, {}, 'New status is same as current status', false, 403);
      }

      if (property.approval_status === ApprovalStatus.REJECTED && status === ApprovalStatus.APPROVED) {
        return sendResponse(res, {}, 'Cannot approve rejected property', false, 403);
      }

      const update_property = await Property.findByIdAndUpdate(id, { approval_status: status }, { new: true });
      if (update_property) {

        // Send notification to landlord
        const notification_payload = {};
        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
        notification_payload.notificationHeading = "Approval Status Updated";
        notification_payload.notificationBody = `Rentranzact has reviewed your property and your current status is ${update_property?.approval_status}`;
        notification_payload.landlordID = property?.landlord_id ?? null;
        notification_payload.propertyID = property._id;
        notification_payload.property_manager_id = property?.property_manager_id ?? null;
        if (property?.landlord_id) {
          notification_payload.send_to = property?.landlord_id;
        } else if (property?.property_manager_id) {
          notification_payload.send_to = property?.property_manager_id;
        }
        const get_send_to_details = await User.findById(notification_payload?.send_to);
        const create_notification = await Notification.create(notification_payload);
        if (create_notification) {
          if (get_send_to_details && get_send_to_details.fcmToken) {
            const metadata = {
              "propertyID": update_property._id.toString(),
              "redirectTo": "property",
            }
            sendNotification(get_send_to_details, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, get_send_to_details.role)
          }
        }
        return sendResponse(res, {}, 'property status updated successfully', true, 200);
      }
    }
    return sendResponse(res, null, "Invalid Id", false, 400);
  } catch (error) {
    console.log(error, '===error')
    return sendResponse(res, [], error.message, false, 400)

  }
}

async function deleteAggrementByID(req, res) {
  const { id } = req.params;

  const data = await LeaseAggrements.findByIdAndDelete(id)
  const regex = /\/([^\/?#]+)\.[^\/?#]+$/;

  if (data) {
    const match = data?.url?.match(regex);
    if (match) {
      const filePath = path.join(__dirname, "../", "uploads", "LeaseAggrements", `${data.renterID}.pdf`)
      try {
        fs.unlinkSync(filePath)
      } catch (error) {
        console.log(error, '====error');
      }
    }
  }

  return sendResponse(res, null, 'Deleted successfully', true, 200);
}
export {
  properties,
  property,
  deleteProperty,
  leaseAggrements,
  updateProperty,
  getAllPropertyList,
  editProperty,
  updatePropertyApprovalStatus,
  deleteAggrementByID
}