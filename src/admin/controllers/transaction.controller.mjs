import { sendResponse } from "../helpers/sendResponse.mjs";
import { getTransactionService } from "../services/transaction.service.mjs";
import { Transaction } from "../../user/models/transactions.model.mjs";


async function getTransaction(req, res) {

  try {
    let { search, sortBy, status, type } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let skip = Number(page - 1) * count;
    let query = {};
    let query2 = {};

    let field = "updatedAt";
    let order = "desc";
    let sort_query = {};
    if (sortBy) {
      field = sortBy.split(' ')[0];
      order = sortBy.split(' ')[1];
    }
    sort_query[field] = order == "desc" ? -1 : 1;

    if (search) {
      query2.$or = [
        { renter_name: { "$regex": search, "$options": "i" } },
        { property_name: { "$regex": search, "$options": "i" } },
        { landlord_name: { "$regex": search, "$options": "i" } },
        { type: { "$regex": search, "$options": "i" } },
        { renter: { "$regex": search, "$options": "i" } },
      ]
    }

    if(type){query.type = type;};
    if(status){query.status = status;};

    let pipeline = [
      {
        $match: query
      },
      {
        $set: {
          renterID: {
            $toObjectId: "$renterID"
          },
          propertyID: {
            $toObjectId: "$propertyID"
          },
          landlordID: {
            $toObjectId: "$landlordID"
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
          from: "properties",
          localField: "propertyID",
          foreignField: "_id",
          as: "property_details"
        }
      },
      {
        $unwind: {
          path: "$property_details",
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
          type: "$type",
          propertyID: "$propertyID",
          renterID: "$renterID",
          landlordID: "$landlordID",
          status: "$status",
          amount: "$amount",
          date: "$date",
          renter: "$renter",
          property: "$property",
          landlord: "$landlord",
          renter_name: "$renter_details.fullName",
          renter_image: "$renter_details.picture",
          landlord_name: "$landlord_details.fullName",
          landloard_image: "$landlord_details.picture",
          property_name: "$property_details.propertyName",
          property_images: "$property_details.images",
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
          ]
        }
      }
    ]

    let result = await Transaction.aggregate(pipeline);
    return sendResponse(res, result, "success", true, 200);

  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }


  // const data = await getTransactionService();


  // sendResponse(res, data.data, data.message, data.status, data.statusCode);
}


export { getTransaction };
