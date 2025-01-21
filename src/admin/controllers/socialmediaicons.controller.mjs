import SocialMediaIcons from "../models/socialmediaicons.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as SocialMediaIconsValidations from "../validations/socialmediaicons.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import * as SocialMediaIconServices from "../services/socialmediaicons.service.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const addSocialMediaIcon = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, SocialMediaIconsValidations.addSocialMediaIcon);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        // let query = { title: req.body.title };

        // let is_exist = await SocialMediaIcons.findOne(query);
        // if (is_exist) {
        //     return sendResponse(res, {}, "Social media icon already exists", false, 400);
        // }

        if (req.file) {
            req.body.media = req?.file?.filename;
        }

        let create_social_media_icon = await SocialMediaIcons.create(req.body);
        if (create_social_media_icon) {
            return sendResponse(res, create_social_media_icon, "Social media icon added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const editSocialMediaIcon = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, SocialMediaIconsValidations.editSocialMediaIcon);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        // let query = {
        //     title: req.body.title,
        //     _id: { $ne: req.body.id }
        // };

        // let social_media_icon_exist = await SocialMediaIcons.findOne(query);
        // if (social_media_icon_exist) {
        //     return sendResponse(res, {}, "social_media_icon already exists", false, 400);
        // }

        let get_social_media_icon = await SocialMediaIcons.findById(req.body.id);
        if (get_social_media_icon) {
            if (req.file) {
                req.body.media = req?.file?.filename;
                if (get_social_media_icon.media) {
                    await SocialMediaIconServices.deleteMedia(get_social_media_icon.media)
                }
            }

            let update_social_media_icon = await SocialMediaIcons.findByIdAndUpdate(req.body.id, req.body, { new: true });
            if (update_social_media_icon) {
                return sendResponse(res, update_social_media_icon, "Social media icon updated successfully", true, 200);
            }
            return sendResponse(res, {}, "Server Error", false, 500);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const getAllSocialMediaIcons = async (req, res) => {
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
                    media: "$media",
                    link: "$link",
                    slug: "$slug",
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

        let data = await SocialMediaIcons.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getSocialMediaIconById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await SocialMediaIcons.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteSocialMediaIcon = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await SocialMediaIcons.findByIdAndDelete(id);
        if (data) {
            if (data.media) {
                await SocialMediaIconServices.deleteMedia(data.media)
            }
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const addUpdateSocialMediaIcons = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, SocialMediaIconsValidations.addUpdateSocialMediaIcons);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let update_icon = await SocialMediaIcons.findOneAndUpdate({
            slug: req.body.slug,
        },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        if (update_icon) {
            return sendResponse(res, update_icon, "Data updated successfully", true, 200);
        }

        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const getSocialMidiaIconsBySlug = async (req, res) => {
    try {
        let { slug } = req.query;
        if (!slug) {
            return sendResponse(res, {}, "Slug required", false, 400);
        }

        let data = await SocialMediaIcons.findOne({ slug: slug });
        if (data) {
            return sendResponse(res, data, "Success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Slug", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}