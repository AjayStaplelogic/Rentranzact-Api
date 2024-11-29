import { sendResponse } from "../../user/helpers/sendResponse.mjs";
import { Notification } from "../../user/models/notification.model.mjs"
import { User } from "../../user/models/user.model.mjs"
import { Property } from "../../user/models/property.model.mjs"
import * as NotificationValidations from "../validations/notification.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { UserRoles } from "../../user/enums/role.enums.mjs";
import * as NotificationServices from "../services/notification.service.mjs";

async function getAllNotifications(req, res) {
  try {
    let { propertyID, search, sortBy, read } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let query = {};
    query.is_send_to_admin = true;
    if (propertyID) { query.propertyID = propertyID };

    let skip = Number(page - 1) * count;
    if (search) {
      query.$or = [
        { notificationHeading: { $regex: search, $options: 'i' } },
        { notificationBody: { $regex: search, $options: 'i' } },
      ]
    }

    if (read) {
      if (read === "true") {
        query["read"] = true;
      } else {
        query["read"] = false;
      }
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
          renterID: {
            $toObjectId: "$renterID"
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "renterID",
          foreignField: "_id",
          as: "renter_details"
        }
      },
      {
        $unwind: {
          path: "$renter_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "landlordID",
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
        $project: {
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          propertyID: "$propertyID",
          renterID: "$renterID",
          notificationHeading: "$notificationHeading",
          notificationBody: "$notificationBody",
          read: "$read",
          amount: "$amount",
          renterApplicationID: "$renterApplicationID",
          landlordID: "$landlordID",
          renter_name: "$renter_details.fullName",
          renter_picture: "$renter_details.picture",
          landlord_name: "$landlord_details.fullName",
          landlord_picture: "$landlord_details.picture",
          send_to: "$send_to",

          inspection_id: "$inspection_id",
          maintanence_id: "$maintanence_id",
          property_manager_id: "$property_manager_id",
          is_send_to_admin: "$is_send_to_admin",
          redirect_to: "$redirect_to",
        }
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
    let get_notifications = await Notification.aggregate(pipeline);
    return sendResponse(res, get_notifications, "success", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function getNotificationById(req, res) {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "Id required", false, 400);
    }

    let query = {};
    if (id) { query._id = id };
    let data = await Notification.findOne(query).lean().exec();
    if (data) {
      if (data.renterID) {
        data.renter_info = await User.findById(data.renterID, {
          fullName: 1,
          phone: 1,
          countryCode: 1,
          picture: 1,
        });
      }

      if (data.landlordID) {
        data.landlord_info = await User.findById(data.landlordID, {
          fullName: 1,
          phone: 1,
          countryCode: 1,
          picture: 1,
        });
      }

      if (data.propertyID) {
        data.property_info = await Property.findById(data.propertyID, {
          propertyName: 1,
          images: 1,
          address: 1,
        });
      }
      return sendResponse(res, data, "success", true, 200);
    }
    return sendResponse(res, {}, "Invalid Id", false, 400);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function readUnreadNotification(req, res) {
  try {
    const { isError, errors } = validator(req.body, NotificationValidations.readUnreadNotification);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 422);
    }

    let notification = await Notification.findByIdAndUpdate(req.body.id, req.body, { new: true });
    if (notification) {
      return sendResponse(res, null, `Notification marked as ${req.body.read ? "read" : "unread"}`, true, 200);
    }
    return sendResponse(res, {}, "Invalid Id", false, 400);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 400);
  }
}

async function manualCreateNotification(req, res) {
  try {
    const { isError, errors } = validator(req.body, NotificationValidations.manualCreateNotification);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 422);
    }

    const user_roles = [];
    const admin_roles = [];
    for await (let role of req.body.roles) {
      if (Object.values(UserRoles).includes(role)) {
        user_roles.push(role);
        continue;
      }

      admin_roles.push(role);
    }

    let notification_content = {
      notificationHeading: req.body.notificationHeading,
      notificationBody: req.body.notificationBody
    }

    user_roles?.length > 0 ? NotificationServices.sendNotificationsToRoles(user_roles, false, notification_content) : null;
    admin_roles?.length > 0 ? NotificationServices.sendNotificationsToRoles(admin_roles, true, notification_content) : null;

    return sendResponse(res, null, "Notification sent successfully", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 422);
  }
}

export {
  getAllNotifications,
  getNotificationById,
  readUnreadNotification,
  manualCreateNotification
};
