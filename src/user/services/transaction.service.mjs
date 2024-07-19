import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";

async function getMyTransaction(userID, role) {
    if (role === UserRoles.RENTER) {

        // const data = await Transaction.find({ renterID: userID })

        const data = await Transaction.aggregate([
            {
                $match: {
                    renterID: userID
                },
            }, {
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
            }
        ])

        return {
            data: data,
            message: "successfully fetched my transactions",
            status: true,
            statusCode: 200,
        };

    } else if (role === UserRoles.LANDLORD) {

        const data = await Transaction.find({ landlordID: userID });

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