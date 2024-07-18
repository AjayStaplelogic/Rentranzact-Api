import { Inspection } from "../models/inspection.model.mjs";
import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";

async function getDashboardStats(user) {
 
    const rented = await Property.find({ landlord_id: user._id, rented: true }).countDocuments();

    const vacant = await Property.find({ landlord_id: user._id, rented: false }).countDocuments();

    const maintenance = await Maintenance.find({landlordID : user._id , status : true });

    const total = await Property.find({ landlord_id: user._id }).countDocuments()

    const mostRecentInspection = await Inspection.aggregate([
        {
            $match: {
                "landlordID": user._id
            }
        },
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
