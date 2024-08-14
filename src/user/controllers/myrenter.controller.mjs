import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { myRentersService } from "../services/myrenter.service.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";

async function myRenters(req, res) {
  const { _id } = req.user.data;

  const data = await myRentersService(_id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getAllMyRenters(req, res) {
  try {
    let { id } = req.query;
    let page = Number(req.query.page) || 1;
    let count = Number(req.query.count) || 10;
    let skip = (page - 1) * count;
    let data = await RentingHistory.aggregate([
      {
        $match: {
          landlordID: `${req.user.data._id}`
        }
      },
      {
        $set: {
          renterID: {
            $toObjectId: "$renterID"
          }
        }
      },
      {
        $group: {
          _id: "$renterID",
          renterID: { $first: "$renterID" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField : "renterID",
          foreignField: "_id",
          as: "renterDetails",
        }
      },
      {
        $unwind: {
          path: "$renterDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          picture: "$renterDetails.picture",
          fullName: "$renterDetails.fullName",
          phone: "$renterDetails.phone",
          email: "$renterDetails.email",
        }
      },
      {
        $facet: {
          renters: [
            {
              $skip : skip
            },
            {
              $limit : count
            }
          ],
          pagination : [
            {
              $count: "total"
            },
            {
              $addFields: {
                page: Number(page)
              }
            }
          ]
        }
      },
    ]);
    return sendResponse(res, data, "My Renter Details fetched successfully", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}

async function myRenterHistory(req, res) {
  try {
    let { id } = req.query;
    let page = Number(req.query.page) || 1;
    let count = Number(req.query.count) || 10;
    let skip = (page - 1) * count;
    let data = await RentingHistory.aggregate([
      {
        $match: {
          renterID: id,
          landlordID: `${req.user.data._id}`
        }
      },
      {
        $set: {
          renterID: {
            $toObjectId: "$renterID"
          },
          landlordID: {
            $toObjectId: "$landlordID"
          }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $facet: {
          // renter: [
          //   {
          //     $group: {
          //       _id: "$renterID",
          //       renterID: { $first: "$renterID" }
          //     }
          //   },
          //   {
          //     $lookup: {
          //       from: "users",
          //       localField : "renterID",
          //       foreignField: "_id",
          //       as: "renterDetails",
          //     }
          //   },
          //   {
          //     $unwind: {
          //       path: "$renterDetails",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     $project: {
          //       picture: "$renterDetails.picture",
          //       fullName: "$renterDetails.fullName",
          //       phone: "$renterDetails.phone",
          //       email: "$renterDetails.email",
          //     }
          //   }
          // ],
          properties: [
            {
              $lookup: {
                from: "properties",
                let: { propertyID: { $toObjectId: "$propertyID" } }, 
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$propertyID"] }, 
                    },
                  },
                ],
                as: "propertyDetails",
              }
            },
            {
              $unwind: {
                path: "$propertyDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                propertyID: "$propertyID",
                propertyName: "$propertyDetails.propertyName",
                images: "$propertyDetails.images",
                address: "$propertyDetails.address",
                // rentType: "$propertyDetails.rentType",
                rent: "$propertyDetails.rent",
                avg_rating: "$propertyDetails.avg_rating",
                total_reviews: "$propertyDetails.total_reviews",
                rentingStart: "$rentingStart",
                rentingEnd: "$rentingEnd",
                rentingType: "$rentingType",
              }
            },
            {
              $skip : skip
            },
            {
              $limit : count
            }
          ],
          pagination : [
            {
              $count: "total"
            },
            {
              $addFields: {
                page: Number(page)
              }
            }
          ]
        }
      },
    ]);

    return sendResponse(res, data, "My Renter Details fetched successfully", true, 200);
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }
}
export { myRenters, myRenterHistory, getAllMyRenters };
