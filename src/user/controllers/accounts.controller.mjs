import { sendResponse } from "../helpers/sendResponse.mjs";
import { User } from "../models/user.model.mjs"
import * as StripeCommonServices from "../services/stripecommon.service.mjs"
import mongoose from "mongoose";
import ConnectedAccounts from "../models/connectedAccounts.model.mjs";
import * as AccountServices from "../services/account.service.mjs";

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

export const getAllCards = async (req, res) => {
    try {
        let { search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
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
        query.user_id = { $eq: new ObjectId(req?.user?.data?._id) }

        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    gateway_type: "$gateway_type",
                    user_id: "$user_id",
                    name: "$name",
                    last4: "$last4",
                    exp_month: "$exp_month",
                    exp_year: "$exp_year",
                    // card_id: "$card_id",
                    // customer_id: "$customer_id",
                    isPrimary: "$isPrimary",
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

        let data = await Cards.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteCard = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let get_card = await Cards.findOne({ _id: id, user_id: req?.user?.data?._id });
        if (get_card) {
            if (get_card.gateway_type === "stripe") { // If the card from stripe, performing options on stripe

                // Removing card from stripe
                let delete_card = await StripeCommonServices.deleteCard({
                    customer_id: get_card.customer_id,
                    card_id: get_card.card_id
                });

                // IF the card successfully deleted from Stripe, then removing it from DB
                if (delete_card && delete_card.deleted) {
                    let remove_from_db = await Cards.findByIdAndDelete(get_card._id);
                    if (remove_from_db) {
                        return sendResponse(res, null, "Card deleted successfully", true, 200);
                    }
                    return sendResponse(res, null, "Failed to delete card", false, 500);
                }
                return sendResponse(res, null, "Failed to delete card from stripe", false, 500);
            }
            return sendResponse(res, null, "Invalid card type", false, 400);
        }
        return sendResponse(res, null, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400);
    }
}