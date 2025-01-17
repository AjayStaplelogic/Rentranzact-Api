import Payouts from "../models/payouts.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as PayoutValidations from "../validations/payout.validation.mjs"
import { validator } from "../helpers/schema-validator.mjs";
import * as StripeCommonServices from "../services/stripecommon.service.mjs";
import * as AccountServices from "../services/account.service.mjs";
import * as WalletServices from "../services/wallet.service.mjs";

import { Types } from "mongoose";
const ObjectId = Types.ObjectId;

export const createPayout = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, PayoutValidations.createPayout);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const account = await AccountServices.getPrimaryAccount(req.user.data._id);
        if (account) {
            const metadata = {
                user_id: `${req.user.data._id}`,
                account_id: `${account._id}`
            }
            const payout = await StripeCommonServices.payout(
                account.connect_acc_id,
                account.external_acc_id,
                account.currency,
                req.body.amount,
                req.body?.description ?? "",
                metadata
            );

            if (payout) {
                const payout_payload = {
                    type: payout.type,
                    account_id: account._id,
                    user_id: req.user.data._id,
                    amount: payout.amount,
                    currency: payout.currency,
                    status: payout.status,
                    payout_id: payout.id,
                    destination: payout.destination,
                    arrival_date: new Date(payout.arrival_date * 1000),
                    arrival_date_timestamp: payout.arrival_date,
                    description: payout.description ?? ""
                }

                if (account.bank_name) {
                    payout_payload.bank_name = account.bank_name;
                }

                if (account.account_holder_name) {
                    payout_payload.account_holder_name = account.account_holder_name;
                }

                if (account.last_four) {
                    payout_payload.last_four = account.last_four;
                }

                const payoutData = await Payouts.create(payout_payload);
                if (payoutData) {
                    WalletServices.fetchBalanceAndUpdateWalletPoints(payoutData.user_id, account.connect_acc_id,)
                    return sendResponse(res, null, "Payout created successfully", true, 200);
                }
                return sendResponse(res, null, "Failed to create payout", false, 400);
            }
        }

        return sendResponse(res, null, "Add account before withdrawl", false, 404);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400)
    }
};

export const getPayouts = async (req, res) => {
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
                { account_holder_name: { $regex: search, $options: 'i' } },
                { bank_name: { $regex: search, $options: 'i' } },
            ]
        }

        let sort_query = {};
        sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

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
                    type: "$type",
                    description: "$description",
                    account_id: "$account_id",
                    user_id: "$user_id",
                    currency: "$currency",
                    amount: "$amount",
                    arrival_date: "$arrival_date",
                    account_holder_name: "$account_holder_name",
                    bank_name: "$bank_name",
                    last_four: "$last_four",
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

        const data = await Payouts.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
};
