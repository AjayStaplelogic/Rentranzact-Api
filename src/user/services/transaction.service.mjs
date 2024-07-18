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


export {
    getMyTransaction
}