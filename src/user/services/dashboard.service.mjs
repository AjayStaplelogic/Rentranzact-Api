import moment from "moment";
import { Inspection } from "../models/inspection.model.mjs";
import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";

async function getDashboardStats(user) {

    const rented = await Property.find({ landlord_id: user._id, rented: true }).countDocuments();

    const vacant = await Property.find({ landlord_id: user._id, rented: false }).countDocuments();

    const maintenance = await Maintenance.find({ landlordID: user._id, status: true }).countDocuments();

    const total = await Property.find({ landlord_id: user._id }).countDocuments()

    const mostRecentInspection = await Inspection.aggregate([
        {
            $match: {
                "landlordID": user._id
            }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ]);

    const totalIncome = await Transaction.find({ landlordID: user._id, status: "succeeded" });

     let data = [{1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0, 6 : 0, 7 : 0, 8 : 0, 9 : 0, 10 : 0, 11 : 0, 12 : 0 }];

     console.log(totalIncome)

    totalIncome.map((i) => {
        const date = moment.unix(i.date);
        const month = date.month() + 1;      

        for (let obj of data) {
            if (obj?.hasOwnProperty(month)) {
                obj[month] += i.amount;
            } 
        }
    })

    return {
        data: {
            count: {
                rented, vacant, maintenance, total
            },
            newestInspectionRequest: mostRecentInspection,
            totalIncome : data

        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { getDashboardStats };
