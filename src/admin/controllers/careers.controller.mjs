import Careers from "../models/careers.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as CareerValidations from "../validations/careers.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";

export const addCareer = async (req, res) => {
    try {
        console.log(`[Add Carrier]`)
        const { isError, errors } = validator(req.body, CareerValidations.addCareer);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = { title: req.body.title };

        let is_exist = await Careers.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "Career already exists", false, 400);
        }

        let add_career = await Careers.create(req.body);
        if (add_career) {
            return sendResponse(res, add_career, "Blog added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const editCareer = async (req, res) => {
    try {
        console.log(`[Add Blog]`)
        const { isError, errors } = validator(req.body, CareerValidations.editCareer);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = {
            title: req.body.title,
            _id: { $ne: req.body.id }
        };

        let is_exist = await Careers.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "Career already exists", false, 400);
        }

        let update_career = await Careers.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (update_career) {
            return sendResponse(res, update_career, "Career updated successfully", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const getAllCareers = async (req, res) => {
    try {
        let { search, sortBy } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
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
        let pipeline = [
            {
                $match: query
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    title: "$title",
                    description: "$description",
                    opening_count: "$opening_count",
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
                    total_openings: [
                        {
                            $group: {
                                _id: null,
                                total_openings: { $sum: "$opening_count" }
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

        let data = await Careers.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getCareerById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Careers.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteCareerById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Careers.findByIdAndDelete(id);
        if (data) {
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}