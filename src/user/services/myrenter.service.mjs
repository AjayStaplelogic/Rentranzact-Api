import { RentingHistory } from "../models/rentingHistory.model.mjs";

async function myRentersService(id) {

    const data = await RentingHistory.aggregate([
        {
            $match: {
                landlordID: id
            },
        }, {
            $lookup: {
                from: "properties",
                let: { propertyID: { $toObjectId: "$propertyID" } }, // Convert propertyID to ObjectId
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$propertyID"] }, // Match ObjectId type
                        },
                    },
                    { $project: { propertyName: 1 , rent_period_end, rented , rent_period_start } }, // Project only the images array from properties
                ],
                as: "propertyDetails",
            }
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
                    { $project: { picture: 1, fullName: 1, phone: 1, email: 1, } }, // Project only the images array from properties
                ],
                as: "renterDetails",
            }
        }
    ])


    return {
        data: data,
        message: "list of renters",
        status: true,
        statusCode: 200,
    };
}


export { myRentersService };
