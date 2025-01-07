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
  } else if (role === UserRoles.PROPERTY_MANAGER) {
    query.pmID = userID;
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
      {
        $addFields: {
          property_manager_id: { $toObjectId: "$pmID" }
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
        $addFields: {
          property_manager_name: "$property_mananger_details.fullName",
          property_manager_image: "$property_mananger_details.picture"
        },
      },
      {
        
        $unset : ["property_mananger_details"]
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };

  } else if (role === UserRoles.LANDLORD) {

    const data = await Transaction.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          let: { userID: { $toObjectId: "$renterID" } }, // Convert propertyID to ObjectId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
              },
            },
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "RenterDetails",
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };



  } else if (role === UserRoles.PROPERTY_MANAGER) {
    const data = await Transaction.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          let: { userID: { $toObjectId: "$renterID" } }, // Convert propertyID to ObjectId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
              },
            },
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "RenterDetails",
        }
      },
      {
        $addFields: {
          property_manager_id: { $toObjectId: "$pmID" }
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
        $addFields: {
          property_manager_name: "$property_mananger_details.fullName",
          property_manager_image: "$property_mananger_details.picture"
        },
      },
      {
        
        $unset : ["property_mananger_details"]
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

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
    {
      $project: {
        type: "$type",
        propertyID: "$propertyID",
        renterID: "$renterID",
        landlordID: "$landlordID",
        status: "$status",
        amount: "$amount",
        date: "$date",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        renter_details: {
          _id: "$renter_details._id",
          fullName: "$renter_details.fullName",
          picture: "$renter_details.picture"
        },
        property_details: {
          _id: "$property_details._id",
          propertyName: "$property_details.propertyName",
          images: "$property_details.images"
        },
        landlord_details: {
          _id: "$landlord_details._id",
          fullName: "$landlord_details.fullName",
          picture: "$landlord_details.picture"
        },
        payment_mode: "$payment_mode",
        intentID: "$intentID",
        wallet: "$wallet",
      }
    }
  ])

  return {
    data: data[0],
    message: "successfully fetched my transactions",
    status: true,
    statusCode: 200,
  };
}

export {
  getMyTransaction,
  transactionByIdService
}