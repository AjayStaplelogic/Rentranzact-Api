
import multer from "multer";
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as Multer from '../helpers/multer.mjs';
import fs from "fs";
import * as s3Service from "../services/s3.service.mjs";

export const uploadSingleImage = async (req, res) => {
    try {
        if (req.file) {
            await s3Service.uploadFile(req.file.path, `common/random/${req?.file?.filename}`, req?.file?.mimetype);
            let resObj = { ...req.file };
            resObj.fullPath = `${process.env.BUCKET_BASE_URL}/common/random/${req.file.filename}`;
            return sendResponse(res, resObj, "success", true, 200);
        }
        return sendResponse(res, {}, "File not found", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const uploadMultipleFiles = async (req, res) => {
    try {
        Multer.upload2.limits = {
            fileSize: 10 * 1000000, // Converting 10 MB into bytes
            files: 10,
        };

        if (req.body.mediaType) {
            Multer.upload2.fileFilter = Multer.fileFilterFun(req.body.mediaType);
        }

        const upload = Multer.upload2.array("media", 10);
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return sendResponse(res, {}, err?.message, false, 400);

            } else if (err) {
                // An unknown error occurred when uploading.
                return sendResponse(res, {}, err?.message, false, 500);
            }

            if (req.files && req.files.length) {
                let res_arr = []
                for await (let file of req.files) {
                    await s3Service.uploadFile(file?.path, `${req?.body?.folder ?? "common/images"}/${file?.filename}`, file?.mimetype);
                    let resObj = {
                        ...file,
                        // fullPath: `${process.env.HOST_URL}${req?.body?.folder ?? "images"}/${file.filename}`
                        fullPath: `${process.env.BUCKET_BASE_URL}/${req?.body?.folder ?? "common/images"}/${file.filename}`
                    }
                    res_arr.push(resObj)
                }
                return sendResponse(res, res_arr, "success", true, 200);
            }
            return sendResponse(res, {}, "File not found", false, 400);
        })
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteFile = async (req, res) => {
    try {
        let { folder, filename } = req.query;
        try {
            fs.unlinkSync(`uploads/${folder ?? "images"}/${filename}`);
            if (!folder) {
                fs.unlinkSync(`uploads/${filename}`);
            }
        } catch (error) {
        }
        return sendResponse(res, [], "success", true, 200);

    } catch (error) {
        return sendResponse(res, {}, error?.message ?? error, false, 400);
    }
}

export const uploadMultipleFilesByAdmin = async (req, res) => {
    try {
        Multer.upload2.limits = {
            fileSize: 10 * 1000000, // Converting 10 MB into bytes
            files: 10,
        };

        if (req.body.mediaType) {
            Multer.upload2.fileFilter = Multer.fileFilterFun(req.body.mediaType);
        }

        const upload = Multer.upload2.array("media", 10);
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return sendResponse(res, {}, err?.message, false, 400);

            } else if (err) {
                // An unknown error occurred when uploading.
                return sendResponse(res, {}, err?.message, false, 500);
            }

            if (req.files && req.files.length) {
                let res_arr = []
                for await (let file of req.files) {
                    await s3Service.uploadFile(file?.path, `${req?.body?.folder ?? "common/images"}/${file?.filename}`, file?.mimetype);
                    let resObj = {
                        ...file,
                        // fullPath: `${process.env.HOST_URL}${req?.body?.folder ?? "images"}/${file.filename}`
                        fullPath: `${process.env.BUCKET_BASE_URL}/${req?.body?.folder ?? "common/images"}/${file.filename}`
                    }
                    res_arr.push(resObj)
                }
                return sendResponse(res, res_arr, "success", true, 200);
            }
            return sendResponse(res, {}, "File not found", false, 400);
        })
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const deleteFilesFromS3 = async (req, res) => {
    try {
        let { filenames } = req.body;
        if (filenames?.length) {
            await s3Service.deleteMultipleFileFromAws(filenames);
        }

        return sendResponse(res, null, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, error?.message ?? error, false, 400);
    }
}