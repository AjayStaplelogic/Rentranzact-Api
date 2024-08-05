import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import mongoose from 'mongoose';

async function getMyTransaction(userID, role, req) {
  let { search, type, status } = req.query;
  let query = {};
  if (search) {
    query.$or = [
      { landlord: { $regex: search, $options: "i" } },
    ]
  }

  if (role === UserRoles.RENTER) {
    query.renterID = userID;
  } else if (role === UserRoles.LANDLORD) {
    query.landlordID = userID;
  }

  if (type) { query.type = type };

  if (status) {
    query.status = status;
  }

  if (role === UserRoles.RENTER) {
    const data = await Transaction.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          let: { userID: { $toObjectId: "$landlordID" } }, // Convert propertyID to ObjectId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
              },
            },
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "landlordDetails",
        }
      },
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };

  } else if (role === UserRoles.LANDLORD) {

    const data = await Transaction.find(query);

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };


  }


}


async function transactionByIdService(id) {

  let data = await Transaction.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id)
      }
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
  ])

  return {
    data: data,
    message: "successfully fetched my transactions",
    status: true,
    statusCode: 200,
  };

}


export {
  getMyTransaction,
  transactionByIdService
}