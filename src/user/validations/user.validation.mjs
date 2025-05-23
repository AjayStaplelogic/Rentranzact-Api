import { UserRoles } from "../enums/role.enums.mjs";
const { RENTER, LANDLORD, PROPERTY_MANAGER } = UserRoles;
import Joi from "joi";
import { address, pagination } from "./common.validation.mjs";
import { EShareVia } from "../enums/referral.enum.mjs"

export const userLogin = Joi.object().keys({
  email: Joi.string().required().error(new Error("email is required")),
  password: Joi.string().required().error(new Error("password is required")),
  fcmToken: Joi.string().optional()
});


export const userSignup = Joi.object().keys({
  fullName: Joi.string()
    .required()
    .min(3)
    .max(20)
    .error(new Error("name should be between 3 to 20 characters")),
  referralCode: Joi.string().optional().allow(""),
  email: Joi.string().email().error(new Error("Valid email id is required")),
  phone: Joi.string().optional().allow("").error(new Error("phone number is required")),
  countryCode: Joi.string().required().error(new Error("country code is required")),
  gender: Joi.string().valid("male", "female", "").allow("").optional().error(new Error("gender is required")),
  terms_n_condition : Joi.boolean().required().error(new Error("Accept terms & conditions")),
  role: Joi.string().valid(RENTER, LANDLORD, PROPERTY_MANAGER).required().error(new Error("Role should be valid")),
  password: Joi.string()
    .optional()
    // .alphanum()    // When user added any special character it gives always error
    .min(6)
    .error(new Error("Your password should be at least 6 characters")),
});


export const userVerify = Joi.object().keys({
  otp: Joi.string()
    .required()
    .min(4).max(4)
    .error(new Error("4 number otp is required")),
  userID: Joi.string().required().error(new Error("UserID is required"))
});

export const socialAuth = Joi.object().keys({
  socialPlatform: Joi.string().valid('google', 'facebook', 'apple'),
  email: Joi.string().email().error(new Error("enter a valid email")),
  email_verified: Joi.boolean().equal("true").error(new Error("Email is not verified")),
  name: Joi.string().equal("true").error(new Error("Enter a valid Name"))
})

export const switchRoleValidation = Joi.object().keys({
  role: Joi.string().required().valid(RENTER, LANDLORD, PROPERTY_MANAGER)
});

export const shareReferralCodeValidation = Joi.object().keys({
  share_via: Joi.string().required().valid(...Object.values(EShareVia)),
  refer_to: Joi.array().items(
    Joi.string().required()
  ).required()
});


export const verifyReferralCodeValidation = Joi.object().keys({
  referralCode: Joi.string().required()
});