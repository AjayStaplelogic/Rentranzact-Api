import * as inviteEmailSerivice from "../emails/invite.emails.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as InviteValidations from "../validations/invite.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { Property } from "../models/property.model.mjs";

export const inviteRenter = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, InviteValidations.inviteRenter);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 422);
        }

        const property = await Property.findById(req.body.property_id);
        if (property) {
            await inviteEmailSerivice.inviteForProperty({
                email: req.body.email,
                property_id: property?._id,
                address: property?.address?.addressText ?? "",
                about_property: property?.aboutProperty ?? ""
            });

            return sendResponse(res, null, "Success", true, 200);
        }

        throw "Property not found"
    } catch (error) {
        return sendResponse(res, null, error?.message, false, 400);
    }
}