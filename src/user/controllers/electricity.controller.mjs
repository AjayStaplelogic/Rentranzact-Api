import { sendResponse } from "../helpers/sendResponse.mjs";
import verifyMeter from "../helpers/verifyMeter.mjs";
import * as ElectricityService from "../services/electricity.service.mjs";
import * as ElectricityValidations from "../validations/electricity.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import Bills from "../models/bills.model.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const payBill = async (req, res) => {
    try {

        const sandboxUrl = "https://sandbox.vtpass.com/api/pay";

        const { meterID, meterType, serviceID } = req.body;

        const isMeterValid = await verifyMeter(meterID, meterType, serviceID);

        if (!isMeterValid) {
            return sendResponse(res, {}, "your meter is not valid", false, 400);
        }

        const payload = {
            "billersCode": meterID,
            "type": meterType,
            "serviceID": serviceID
        }

        const headers = {
            "api-key": sandboxApiKey,
            "secret-key": sandboxSecretKey
        }

        const data = await axios.post(sandboxUrl, payload, { headers });

        consolel


        //  return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getAllBillers = async (req, res) => {
    try {
        let { category_code, country_code } = req.query;
        const get_billers = await ElectricityService.getBillers(category_code, country_code);
        return sendResponse(res, get_billers, "Billers fetched successfully", true, 200);
    } catch (error) {
        return sendResponse(res, null, error.message, false, 400);
    }
}

export const getAllBillerBills = async (req, res) => {
    try {
        let { biller_code } = req.query;
        const get_bills = await ElectricityService.getBillerBills(biller_code);
        return sendResponse(res, get_bills, "Bills fetched successfully", true, 200);
    } catch (error) {
        return sendResponse(res, null, error.message, false, 400);
    }
}

export const payElectricityBill = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, ElectricityValidations.payElectricityBill);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const validate_bill = await ElectricityService.validateBill(req.body.item_code, req.body.biller_code, req.body.meter_number);
        if (validate_bill) {
            return sendResponse(res, validate_bill?.data, validate_bill?.message, true, 200);
        }
        throw "Invalid bill information";

    } catch (error) {
        console.log(error, '======error')
        return sendResponse(res, null, error.message, false, 400);
        // return sendResponse(res, {
        //   "response_code": "00",
        // "address": null,
        // "response_message": "Successful",
        // "name": "Test DSTV Account",
        // "biller_code": "BIL119",
        // "customer": "0025401100",
        // "product_code": "CB141",
        // "email": null,
        // "fee": 0,
        // "maximum": 0,
        // "minimum": 0
        // }, "sucess", true, 200);

    }
}

export const getBillHistory = async (req, res) => {
    try {
        let { search, status } = req.query;
        const sort_key = req.query.sort_key || "createdAt";
        const sort_order = req.query.sort_order || "desc";
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {
            user_id: new ObjectId(req.user.data._id)
        };
        if (status) { query.status = status; };

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { status: { $regex: search, $options: 'i' } },
            ]
        }

        let sort_query = {};
        sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

        // console.log(query, '====query')
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    status: "$status",
                    // user_id: "$user_id",
                    bill_amount: "$bill_amount",
                    refund_id: "$refund_id",
                }
            },
            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $sort: sort_query
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ],

                }
            }

        ]

        const data = await Bills.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
};