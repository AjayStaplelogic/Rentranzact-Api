import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { myRentersService } from "../services/myrenter.service.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";
import { Property } from "../models/property.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

async function myRenters(req, res) {
  const { _id } = req.user.data;

  const data = await myRentersService(_id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getAllMyRenters(req, res) {
  try {

    const role = req.user.data.role;

    let { id, current_status } = req.query;
    let page = Number(req.query.page) || 1;
    let count = Number(req.query.count) || 10;
    let skip = (page - 1) * count;
    let query = {};

    if (role === UserRoles.LANDLORD) {
      query.landlordID = `${req.user.data._id}`;
      if (current_status) {
        let renters = await Property.distinct("renterID", {
          landlord_id: req?.user?.data?._id,
          renterID: { $nin: ["", null] },
        }).lean().exec();
        if (current_status == "active") {
          query.renterID = { $in: renters };
        } else if (current_status == "past") {
          query.renterID = { $nin: renters }
        }
      }
    } else if (role === UserRoles.PROPERTY_MANAGER) {
      query.pmID = `${req.user.data._id}`;
      if (current_status) {
        let renters = await Property.distinct("renterID", {
          property_manager_id: req?.user?.data?._id,
          renterID: { $nin: ["", null] },
        }).lean().exec();

        if (current_status == "active") {
          query.renterID = { $in: renters };
        } else if (current_status == "past") {
          query.renterID = { $nin: renters }
        }
      }
    }

    let data = await RentingHistory.aggregate([
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
        $group: {
          _id: "$renterID",
          renterID: { $first: "$renterID" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "renterID",
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
          permanentAddress: "$renterDetails.permanentAddress"
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
          renters: [
            {
              $skip: skip
            },
            {
              $limit: count
            }
          ],
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
    let query = {
      renterID: id,
    };

    const role = req?.user?.data?.role;
    if (role === UserRoles.LANDLORD) {
      query.landlordID = `${req?.user?.data?._id}`;

    } else if (role === UserRoles.PROPERTY_MANAGER) {
      query.pmID = `${req?.user?.data?._id}`;
    }

    let data = await RentingHistory.aggregate([
      {
        $match:query
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
          renter: [
            {
              $group: {
                _id: "$renterID",
                renterID: { $first: "$renterID" }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "renterID",
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
                permanentAddress: "$renterDetails.permanentAddress"
              }
            }
          ],
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
                rent: "$propertyDetails.rent",
                avg_rating: "$propertyDetails.avg_rating",
                total_reviews: "$propertyDetails.total_reviews",
                rent_period_end: "$rentingStart",
                rent_period_start: "$rentingEnd",
                rentType: "$rentingType",
              }
            },
            {
              $skip: skip
            },
            {
              $limit: count
            }
          ],
          pagination: [
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

async function rentedProperties(req, res) {
  console.log(`[My Renter/Current-Rented/Properties]`)
  try {
    let { id } = req.query;
    let page = Number(req.query.page) || 1;
    let count = Number(req.query.count) || 10;
    let skip = (page - 1) * count;

    let query = {
      renterID: id,
      rented: true
    };

    const role = req?.user?.data?.role;
    if (role === UserRoles.LANDLORD) {
      query.landlord_id = `${req?.user?.data?._id}`;

    } else if (role === UserRoles.PROPERTY_MANAGER) {
      query.property_manager_id = `${req?.user?.data?._id}`;
    }

    // console.log(query);
    let data = await Property.aggregate([
      {
        $match: query
      },
      {
        $set: {
          renterID: {
            $toObjectId: "$renterID"
          },
          landlord_id: {
            $toObjectId: "$landlord_id"
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
          renter: [
            {
              $group: {
                _id: "$renterID",
                renterID: { $first: "$renterID" },
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "renterID",
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
                permanentAddress: "$renterDetails.permanentAddress"
              }
            }
          ],
          properties: [
            {
              $project: {
                propertyID: "$propertyID",
                propertyName: "$propertyName",
                images: "$images",
                address: "$address",
                rent: "$rent",
                avg_rating: "$avg_rating",
                total_reviews: "$total_reviews",
                rent_period_end: "$rent_period_end",
                rent_period_start: "$rent_period_start",
                rentType: "$rentType",
                lease_end_timestamp: "$lease_end_timestamp",
              }
            },
            {
              $skip: skip
            },
            {
              $limit: count
            }
          ],
          pagination: [
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

export { myRenters, myRenterHistory, getAllMyRenters, rentedProperties };
