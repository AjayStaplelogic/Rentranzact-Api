import { sendResponse } from "../helpers/sendResponse.mjs";
import { User } from "../models/user.model.mjs"
import * as StripeCommonServices from "../services/stripecommon.service.mjs"
import mongoose from "mongoose";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";
import * as AccountServices from "../services/account.service.mjs";
import Accounts from "../models/accounts.model.mjs";

const ObjectId = mongoose.Types.ObjectId;

export const createConnectedAccount = async (req, res) => {
    try {
        const query = {
            user_id: req.user.data._id,
            isDeleted: false
        }

        const get_account = await ConnectedAccounts.findOne(query);
        if (get_account) {
            const account_link = await StripeCommonServices.createAccountLink(get_account.connect_acc_id, "account_update");
            if (account_link) {
                return sendResponse(res, account_link, "success", true, 200);
            }
            throw "Server Error"
        }

        const create_stripe_account = await StripeCommonServices.createAccount(req.user.data);
        console.log(create_stripe_account, '====create_stripe_account')
        if (create_stripe_account) {
            const create_account = await AccountServices.addUpdateAccount(req.user.data._id, create_stripe_account);
            if (create_account) {
                const account_link = await StripeCommonServices.createAccountLink(create_stripe_account.id, "account_onboarding");
                if (account_link) {
                    return sendResponse(res, account_link, "success", true, 200);
                }
            }
        }
        throw "Server Error"
    } catch (error) {
        console.log(error, '=======error');
        return sendResponse(res, null, `${error}`, false, 400);
    }
}

export const getConnectedAccount = async (req, res) => {
    try {
        const get_account = await ConnectedAccounts.findOne({
            user_id: req.user.data._id,
            isDeleted: false
        });

        if (get_account) {
            return sendResponse(res, get_account, "success", true, 200);
        }

        return sendResponse(res, {}, "Account not found", false, 404);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400);
    }
}


export const getAllAccounts = async (req, res) => {
    try {
        let { search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { account_holder_name: { $regex: search, $options: 'i' } },
            ]
        }
        let field = "createdAt";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;
        query.user_id = new ObjectId(req?.user?.data?._id);

        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    account_holder_name: "$account_holder_name",
                    bank_name: "$bank_name",
                    country: "$country",
                    currency: "$currency",
                    status: "$status",
                    isDeleted: "$isDeleted"
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

        let data = await Accounts.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}
