import Blogs from "../models/blogs.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as blogValidations from "../validations/blogs.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import * as blogServices from "../services/blog.service.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import * as s3Service from "../../user/services/s3.service.mjs";
import path from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addBlog = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, blogValidations.addBlog);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = { title: req.body.title };

        let blog_exist = await Blogs.findOne(query);
        if (blog_exist) {
            return sendResponse(res, {}, "Blog already exists", false, 400);
        }

        if (req.file) {
            const relativePath = path.resolve(__dirname, '..', '..', '..', "uploads", "blogs", req?.file?.filename)
            await s3Service.uploadFile(relativePath, `blogs/${req?.file?.filename}`, req?.file?.mimetype)
            req.body.media = `${process.env.BUCKET_BASE_URL}/blogs/${req?.file?.filename}`;
        }
        let create_blog = await Blogs.create(req.body);
        if (create_blog) {
            return sendResponse(res, create_blog, "Blog added successfully", true, 200);
        }
        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const editBlog = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, blogValidations.editBlog);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        req.body.title = req.body.title.toLowerCase().trim();
        let query = {
            title: req.body.title,
            _id: { $ne: req.body.id }
        };

        let blog_exist = await Blogs.findOne(query);
        if (blog_exist) {
            return sendResponse(res, {}, "Blog already exists", false, 400);
        }

        let get_blog = await Blogs.findById(req.body.id);
        if (get_blog) {
            if (req.file) {
                const relativePath = path.resolve(__dirname, '..', '..', '..', "uploads", "blogs", req?.file?.filename)
                await s3Service.uploadFile(relativePath, `blogs/${req?.file?.filename}`, req?.file?.mimetype)
                req.body.media = `${process.env.BUCKET_BASE_URL}/blogs/${req?.file?.filename}`;
                // req.body.media = req?.file?.filename;
                if (get_blog.media) {
                    // await blogServices.deleteMedia(get_blog.media)
                    const keyToDelete = await s3Service.getKeyNameForFileUploaded(get_blog.media);
                    await s3Service.deleteFileFromAws(keyToDelete)
                }
            }

            let update_blog = await Blogs.findByIdAndUpdate(req.body.id, req.body, { new: true });
            if (update_blog) {
                return sendResponse(res, update_blog, "Blog updated successfully", true, 200);
            }
            return sendResponse(res, {}, "Server Error", false, 500);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const getAllBlogs = async (req, res) => {
    try {
        let { search, status, exclude_id } = req.query;
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        const sort_key = req.query.sort_key || "createdAt";
        const sort_order = req.query.sort_order || "desc";
        let query = {};
        if (status) { query.status = status; };

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
            ]
        }
        let sort_query = {};
        sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

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

        let data = await Blogs.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getBlogById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Blogs.findById(id);
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteBlog = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Blogs.findByIdAndDelete(id);
        if (data) {
            if (data.media) {
                // await blogServices.deleteMedia(data.media)
                const keyToDelete = await s3Service.getKeyNameForFileUploaded(data.media);
                await s3Service.deleteFileFromAws(keyToDelete)
            }
            return sendResponse(res, {}, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}