import { Inspection } from "../models/inspection.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";

async function getDashboardStats(user) {

    console.log(user, "00000userrrrr")

    const rented = await Property.find({ landlord_id: user._id, rented: true }).countDocuments();

    const vacant = await Property.find({ landlord_id: user._id, rented: false }).countDocuments();

    const maintenance = 0;

    const total = await Property.find({ landlord_id: user._id }).countDocuments()


    // const mostRecentInspection = await Inspection.aggregate([
    //     { $sort: { createdAt: -1 } },

    //     // Limit to the first document (which will be the newest one)
    //     { $limit: 1 },

    //     {
    //         $lookup: {
    //             from: "properties",
    //             let: { propertyID: { $toObject: "$_id" } },
    //             pipeline: [
    //                 {
    //                     $addFields: {
    //                         propertyIDObjectId: { $toObjectId: "$propertyID" }
    //                     }
    //                 },
    //                 {
    //                     $match: {
    //                         $and: [
    //                             { $expr: { $eq: ["$propertyIDObjectId", "$$propertyId"] } }
    //                         ]
    //                     }
    //                 }
    //             ],
    //             as: "propertyDetails"
    //         }
    //     }


    // ])

    return {
        data: {
            count: {
                rented, vacant, maintenance, total
            },
            newestInspectionRequest: {

            }


        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { getDashboardStats };
