import moment from "moment";
import { Inspection } from "../models/inspection.model.mjs";
import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import { InspectionStatus } from "../enums/inspection.enums.mjs";
import { ETRANSACTION_LANDLORD_PAYMENT_STATUS, ETRANSACTION_PM_PAYMENT_STATUS } from "../enums/common.mjs";

async function getDashboardStats(user) {
    const rented = await Property.find({ landlord_id: user._id, rented: true }).countDocuments();
    const vacant = await Property.find({ landlord_id: user._id, rented: false }).countDocuments();
    const maintenance = await Maintenance.find({ landlordID: user._id, status: "pending" }).countDocuments();
    const total = await Property.find({ landlord_id: user._id }).countDocuments()
    const mostRecentInspection = await Inspection.aggregate([
        {
            $match: {
                "landlordID": user._id,
                "inspectionStatus": InspectionStatus.INITIATED
            }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ]);
    const totalIncome = await Transaction.find({
        landlordID: user._id,
        status: {
            $in: [
                "succeeded",
                "success",
                "successful"
            ]
        },
        createdAt: {
            $gte: moment().startOf('year').toDate(),
            $lte: moment().endOf('year').toDate()
        },
        landlord_payment_status: ETRANSACTION_LANDLORD_PAYMENT_STATUS.paid,
    });

    const recentTransaction = await Transaction.aggregate([
        {
            $match: {
                landlordID: user._id,
                landlord_payment_status: ETRANSACTION_LANDLORD_PAYMENT_STATUS.paid
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
                    { $project: { picture: 1 } }, // Project only the images array from properties
                ],
                as: "RenterDetails",
            }
        },
        {
            $set : {
                amount : "$allCharges.landlord_earning"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 3
        }
    ])

    let data = [{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }];
    totalIncome.map((i) => {
        const date = moment.unix(i.date);
        const month = date.month() + 1;
        for (let obj of data) {
            if (obj?.hasOwnProperty(month)) {
                if(i?.allCharges?.landlord_earning){
                    obj[month] += i?.allCharges?.landlord_earning;
                }
                // else{
                //     obj[month] += 0;
                // }
            }
        }
    })

    return {
        data: {
            count: {
                rented, vacant, maintenance, total
            },
            newestInspectionRequest: mostRecentInspection,
            totalIncome: data,
            recentTransaction: recentTransaction

        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}


async function getDashboardStatsPM(user) {
    const rented = await Property.find({ property_manager_id: user._id, rented: true }).countDocuments();
    const vacant = await Property.find({ property_manager_id: user._id, rented: false }).countDocuments();
    const maintenance = await Maintenance.find({ property_manager_id: user._id, status: "pending" }).countDocuments();
    const total = await Property.find({ property_manager_id: user._id }).countDocuments()
    const mostRecentInspection = await Inspection.aggregate([
        {
            $match: {
                "property_manager_id": user._id,
                "inspectionStatus": InspectionStatus.INITIATED
            }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ]);

    const totalIncome = await Transaction.find({
        pmID: user._id,
        status: {
            $in: [
                "succeeded",
                "success",
                "successful"
            ]
        },
        createdAt: {
            $gte: moment().startOf('year').toDate(),
            $lte: moment().endOf('year').toDate()
        },
        pm_payment_status: ETRANSACTION_PM_PAYMENT_STATUS.paid
    });

    const recentTransaction = await Transaction.find({
        pmID: user._id,
        pm_payment_status: ETRANSACTION_PM_PAYMENT_STATUS.paid
    }).sort({ createdAt: -1 }).limit(3).select('amount property renter date')
    let data = [{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }];
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
            totalIncome: data,
            recentTransaction: recentTransaction

        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };
}


export { getDashboardStats, getDashboardStatsPM };
