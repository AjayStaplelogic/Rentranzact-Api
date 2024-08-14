
import { getDashboardStats } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { Transaction } from "../../user/models/transactions.model.mjs";

async function financePerformance(req, res) {


    const year = Number(req.params.year);

    const data = await Transaction.aggregate(
        [
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                }
            },
            {
                $match: {
                    // Filter documents to include only those with the specified year
                    year: year // Replace 'specifiedYear' with the actual year from frontend
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    total_service_charge: { $sum: "$allCharges.service_charge" },
                    total_rent: { $sum: "$allCharges.rent" },
                    total_insurance: { $sum: "$allCharges.insurance" },
                    total_agency_fee: { $sum: "$allCharges.agency_fee" },
                    total_legal_fee: { $sum: "$allCharges.legal_fee" },
                    total_caution_deposite: { $sum: "$allCharges.caution_deposite" },
                    total_amount: { $sum: "$allCharges.total_amount" },
                    total_amount_transactions: { $sum: "$amount" },
                    count: { $sum: 1 } // Count the number of documents
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field if you don't need it in the output
                    year: "$_id.year",
                    month: "$_id.month",
                    total_service_charge: 1,
                    total_rent: 1,
                    total_insurance: 1,
                    total_agency_fee: 1,
                    total_legal_fee: 1,
                    total_caution_deposite: 1,
                    total_amount: 1,
                    total_amount_transactions: 1,
                    count: 1
                }
            }
        ]

    )


    sendResponse(res, data, "data fetched succsfully", true, 200);
}

export { financePerformance };
