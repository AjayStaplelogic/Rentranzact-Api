import Banners from "../models/banners.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as bannerValidations from "../validations/banners.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import * as bannerServices from "../services/banner.service.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const addBanner = async (req, res) => {
    try {
        console.log(`[Add Banner]`)
        const { isError, errors } = validator(req.body, bannerValidations.addBanner);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = { title: req.body.title };

        let banner_exist = await Banners.findOne(query);
        if (banner_exist) {
            return sendResponse(res, {}, "Banner already exists", false, 400);
        }

        if (req.file) {
            req.body.media = req?.file?.filename;
        }

        let create_banner = await Banners.create(req.body);
        if (create_banner) {
            return sendResponse(res, create_banner, "Banner added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const editBanner = async (req, res) => {
    try {
        console.log(`[Add Banner]`)
        const { isError, errors } = validator(req.body, bannerValidations.editBanner);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = {
            title: req.body.title,
            _id: { $ne: req.body.id }
        };

        let banner_exist = await Banners.findOne(query);
        if (banner_exist) {
            return sendResponse(res, {}, "Banner already exists", false, 400);
        }

        let get_banner = await Banners.findById(req.body.id);
        if (get_banner) {
            if (req.file) {
                req.body.media = req?.file?.filename;
                if (get_banner.media) {
                    await bannerServices.deleteMedia(get_banner.media)
                }
            }

            let update_banner = await Banners.findByIdAndUpdate(req.body.id, req.body, { new: true });
            if (update_banner) {
                return sendResponse(res, update_banner, "Banner updated successfully", true, 200);
            }
            return sendResponse(res, {}, "Server Error", false, 500);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        console.log(error)
        return sendResponse(res, {}, `${error}`, false, 400);

    }
}

export const getAllBanners = async (req, res) => {
    try {
        let { search, status, sortBy, exclude_id } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {};
        if (status) { query.status = status; };

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

        if (exclude_id) {
            query._id = { $ne: new ObjectId(exclude_id) }
        }

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
                    title: "$title",
                    media: "$media",
                    content: "$content",
                    page:"$page"
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

        let data = await Banners.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getBannerById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Banners.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteBanner = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Banners.findByIdAndDelete(id);
        console.log(data);
        if (data) {
            if (data.media) {
                await bannerServices.deleteMedia(data.media)
            }
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}