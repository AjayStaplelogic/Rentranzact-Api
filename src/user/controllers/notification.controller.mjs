import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getNotificationService } from "../services/notification.service.mjs";
import { Notification } from "../models/notification.model.mjs"
import { UserRoles } from '../enums/role.enums.mjs';
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

async function getNotification(req, res) {

  // console.log(req.user, "-----user")

  const userID = req.user.data._id;

  const data = await getNotificationService(userID);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getAllNotifications(req, res) {
  try {
    const role = req.user.data.role;
    let { propertyID, search, sortBy, read } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let query = {};
    if (propertyID) { query.propertyID = propertyID };
    if (role == UserRoles.LANDLORD) { query.landlordID = new ObjectId(req.user.data._id) };
    if (role == UserRoles.RENTER) { query.renterID = req.user.data._id };

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
    console.log(query, '====query')
    let pipeline = [
      {
        $match: query
      },
      {
        $project: {
          createdAt : "$createdAt",
          updatedAt : "$updatedAt",
          propertyID: "$propertyID",
          renterID: "$renterID",
          notificationHeading: "$notificationHeading",
          notificationBody: "$notificationBody",
          read: "$read",
          amount: "$amount",
          renterApplicationID: "$renterApplicationID",
          landlordID: "$landlordID",
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
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

export { getNotification, getAllNotifications };
