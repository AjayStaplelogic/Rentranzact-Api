import Testimonials from "../models/testimonials.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as TestimonialValidations from "../validations/testimonials.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import * as TestimonialServices from "../services/testimonials.service.mjs";

export const addTestimonial = async (req, res) => {
    try {
        console.log(`[Add testimonial]`)
        console.log(req.body)
        const { isError, errors } = validator(req.body, TestimonialValidations.addTestimonial);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.name = req.body.name.toLowerCase().trim();
        let query = { name: req.body.name };

        let is_exist = await Testimonials.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "testimonial already exists", false, 400);
        }

        if (req.file) {
            req.body.media = req?.file?.filename;
        }

        let create_testimonial = await Testimonials.create(req.body);
        if (create_testimonial) {
            return sendResponse(res, create_testimonial, "testimonial added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const editTestimonial = async (req, res) => {
    try {
        console.log(`[Add testimonial]`)
        const { isError, errors } = validator(req.body, TestimonialValidations.editTestimonial);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.name = req.body.name.toLowerCase().trim();
        let query = {
            name: req.body.name,
            _id: { $ne: req.body.id }
        };

        let is_exist = await Testimonials.findOne(query);
        if (is_exist) {
            return sendResponse(res, {}, "testimonial already exists", false, 400);
        }

        let get_testimonial = await Testimonials.findById(req.body.id);
        if (get_testimonial) {
            if (req.file) {                
                req.body.media = req?.file?.filename;
                if (get_testimonial.media) {
                    await TestimonialServices.deleteMedia(get_testimonial.media)
                }
            }

            let update_testimonial = await Testimonials.findByIdAndUpdate(req.body.id, req.body, { new: true });
            if (update_testimonial) {
                return sendResponse(res, update_testimonial, "testimonial updated successfully", true, 200);
            }
            return sendResponse(res, {}, "Server Error", false, 500);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const getAllTestimonials = async (req, res) => {
    try {
        let { search, status } = req.query;
        const sort_key = req.query.sort_key || "createdAt";
        const sort_order = req.query.sort_order || "desc";
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        if (status) { query.status = status; };

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
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
                    name: "$name",
                    role: "$role",
                    description: "$description",
                    media: "$media",
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

        let data = await Testimonials.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getTestimonialById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Testimonials.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteTestimonial = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Testimonials.findByIdAndDelete(id);
        if (data) {
            if (data.media) {
                await TestimonialServices.deleteMedia(data.media)
            }
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}