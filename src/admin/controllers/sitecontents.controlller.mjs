import { sendResponse } from "../../user/helpers/sendResponse.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import SiteContents from "../models/sitecontents.model.mjs";
import * as siteContentValidations from "../validations/sitecontents.validation.mjs"

export const addUpdateSiteContent = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, siteContentValidations.addUpdateSiteContent);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        let update_content = await SiteContents.findOneAndUpdate({
            slug: req.body.slug,
        },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        if (update_content) {
            return sendResponse(res, update_content, "Site content updated successfully", true, 200);
        }

        return sendResponse(res, {}, "Server Error", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}

export const getSiteContentBySlug = async (req, res) => {
    try {
        let { slug } = req.query;
        if (!slug) {
            return sendResponse(res, {}, "Slug required", false, 400);
        }

        let data = await SiteContents.findOne({ slug: slug });
        if (data) {
            return sendResponse(res, data, "Success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Slug", false, 500);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 400);
    }
}