import Faqs from "../models/faqs.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as FaqValidations from "../validations/faq.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";

export const addFaq = async (req, res) => {
    try {
        console.log(`[Add Faq]`)
        const { isError, errors } = validator(req.body, FaqValidations.addFaq);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.question = req.body.question.toLowerCase().trim();
        let query = { question: req.body.question };

        let is_exist = await Faqs.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "Faq already exists", false, 400);
        }

        let add_faq = await Faqs.create(req.body);
        if (add_faq) {
            return sendResponse(res, add_faq, "Faq added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const editFaq = async (req, res) => {
    try {
        console.log(`[Edit Faq]`)
        const { isError, errors } = validator(req.body, FaqValidations.editFaq);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.question = req.body.question.toLowerCase().trim();
        let query = {
            question: req.body.question,
            _id: { $ne: req.body.id }
        };

        let is_exist = await Faqs.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "faq already exists", false, 400);
        }

        let update_faq = await Faqs.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (update_faq) {
            return sendResponse(res, update_faq, "Faq updated successfully", true, 200);
        }
        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const getAllFaqs = async (req, res) => {
    try {
        let { search, sortBy, category, status } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { question: { $regex: search, $options: 'i' } },
            ]
        }

        if(category){
            query.category = category;
        }

        if(status){
            query.status = status;
        }

        let field = "createdAt";
        let order = "desc";
        let sort_query = {};
        if (sortBy) {
            field = sortBy.split(' ')[0];
            order = sortBy.split(' ')[1];
        }
        sort_query[field] = order == "desc" ? -1 : 1;
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    category: "$category",
                    question: "$question",
                    answer: "$answer",
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

        let data = await Faqs.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getFaqById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Faqs.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteFaqById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Faqs.findByIdAndDelete(id);
        if (data) {
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}