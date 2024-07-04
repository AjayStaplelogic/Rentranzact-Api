import { Inspection } from "../models/inspection.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";

async function getDashboardStats(user) {

    console.log(user, "00000userrrrr")

    const rented = await Property.find({ landlord_id: user._id, rented: true }).countDocuments();

    const vacant = await Property.find({ landlord_id: user._id, rented: false }).countDocuments();

    const maintenance = 0;

    const total = await Property.find({ landlord_id: user._id }).countDocuments()


    const mostRecentInspection = await Inspection.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ])

    return {
        data: {
            count: {
                rented, vacant, maintenance, total
            },
            newestInspectionRequest: mostRecentInspection


        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { getDashboardStats };
