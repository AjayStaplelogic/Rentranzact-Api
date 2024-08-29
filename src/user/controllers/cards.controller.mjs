import { sendResponse } from "../helpers/sendResponse.mjs";
import Cards from "../models/cards.model.mjs";
import { User } from "../models/user.model.mjs"
import * as cardValidations from "../validations/card.validation.mjs"
import { validator } from "../helpers/schema-validator.mjs";
import * as StripeCommonServices from "../services/stripecommon.service.mjs"
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const addCard = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, cardValidations.addCard);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let user = req.user.data;
        req.body.user_id = req.user.data._id;
        let { gateway_type } = req.body;
        if (gateway_type === "stripe") {        // If card for stripe
            let customer_id = user.customer_id ?? "";

            // Checking if the user is not customer on stripe then adding a new customer
            if (!user.customer_id) {
                let create_customer = await StripeCommonServices.addCustomer(user);
                if (create_customer) {
                    let update_user = await User.findByIdAndUpdate(user._id, {
                        customer_id: create_customer.id,
                    },
                        {
                            new: true
                        });
                    if (update_user) {
                        customer_id = create_customer.id;
                    }
                } else {
                    return sendResponse(res, null, "Failed to create stripe customer", false, 500);
                }
            }

            // Adding a new card to the customer on stripe
            let add_card = await StripeCommonServices.addCard({
                customer_id: customer_id,
                card_token: req.body.card_token
            });

            if (add_card) {
                req.body.exp_month = add_card.exp_month;
                req.body.exp_year = add_card.exp_year;
                req.body.last4 = add_card.last4;
                req.body.card_id = add_card.id;
                req.body.customer_id = customer_id;
                req.body.name = add_card.name;
                let query = {
                    user_id: user._id,
                    last4: req.body.last4,
                };

                let get_card = await Cards.findOne(query); // Quering for the same card exist in db for same user
                if (!get_card) { // If not exist, then creating entry in DB for new card
                    let add_in_db = await Cards.create(req.body);
                    if (add_in_db) {
                        return sendResponse(res, null, "Card added successfully", true, 200);  // sending success response
                    }
                    return sendResponse(res, null, "Failed to add card", false, 500);
                }
                // Deleting the card from stripe
                // If card already exists in db then deleting card from stripe that just created on stripe
                await StripeCommonServices.deleteCard({
                    customer_id: customer_id,
                    card_id: add_card.id
                })
                return sendResponse(res, {}, "Card already exists", false, 400);
            }
            return sendResponse(res, null, "Failed to add card", false, 500);
        }

        throw "Invalid gateway type"
    } catch (error) {
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
                    card_id: "$card_id",
                    customer_id: "$customer_id",
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