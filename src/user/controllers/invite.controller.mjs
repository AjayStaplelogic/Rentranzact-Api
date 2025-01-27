import * as inviteEmailSerivice from "../emails/invite.emails.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as InviteValidations from "../validations/invite.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { Property } from "../models/property.model.mjs";
import Invites from "../models/invites.model.mjs";
import generateReferralCode from "../helpers/referalCodeGenerator.mjs";

export const inviteRenter = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, InviteValidations.inviteRenter);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 422);
        }

        req.body.email = req.body.email.toLowerCase().trim();
        const get_invitaton = await Invites.findOne({
            email: req.body.email,
            invited_by: req.user.data._id,
            property_id: req.body.property_id
        });
        if (!get_invitaton) {
            const property = await Property.findById(req.body.property_id);
            if (property) {
                const invitation_token = generateReferralCode();
                req.body.invitation_token = invitation_token;
                req.body.invited_by = req.user.data._id;
                if (req.body.rent_expiration_date) {
                    req.body.rent_expiration_date_str = req.body.rent_expiration_date
                    req.body.rent_expiration_date = new Date(req.body.rent_expiration_date);
                }
                const create_invitation = await Invites.create(req.body);
                if (create_invitation) {
                    await inviteEmailSerivice.inviteForProperty({
                        email: create_invitation.email,
                        property_id: property?._id,
                        address: property?.address?.addressText ?? "",
                        about_property: property?.aboutProperty ?? "",
                        invitation_token: create_invitation.invitation_token
                    });

                    return sendResponse(res, null, "Success", true, 200);
                }
                return sendResponse(res, null, "Server Error", false, 500);
            }
            return sendResponse(res, null, "Property Not Found", false, 400);
        }
        return sendResponse(res, null, "Already Invited for the same property", false, 400);
    } catch (error) {
        return sendResponse(res, null, error?.message, false, 400);
    }
}