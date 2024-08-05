import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";

async function getMyTransaction(userID, role, req) {
  let { search, type, status} = req.query;
  let query = {};
  if(search){
    query.$or = [
      {landlord : {$regex: search, $options : "i"}},
    ]
  }
  
  if (role === UserRoles.RENTER) {
    query.renterID = userID;
  }else if(role === UserRoles.LANDLORD){
    query.landlordID = userID;
  }
  
  if(type){query.type = type};

  if(status){
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
        $match : query2
      }
      
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


  // const data = await Transaction.aggregate([
  //     {
  //         $match: {
  //             renterID: userID
  //         },
  //     }, {
  //         $lookup: {
  //             from: "users",
  //             let: { userID: { $toObjectId: "$landlordID" } }, // Convert propertyID to ObjectId
  //             pipeline: [
  //                 {
  //                     $match: {
  //                         $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
  //                     },
  //                 },
  //                 { $project: { picture: 1 } }, // Project only the images array from properties
  //             ],
  //             as: "landlordDetails",
  //         }
  //     }
  // ])


  const id1 = new ObjectId(id)
  const data = await Transaction.aggregate([
    {

      $match: {
        "_id": id1
      }
    },
    {
      $lookup: {
        from: "users",
        let: { renter_ID: { $toObjectId: "$landlord_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$renter_ID"] }
            }
          }
        ],
        as: "landlord_info",

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


export {
  getMyTransaction,
  transactionByIdService
}