import { UserRoles } from "../enums/role.enums.mjs";
const { RENTER, LANDLORD, PROPERTY_MANAGER } = UserRoles;
import Joi from "joi";
import { address, pagination } from "./common.validation.mjs";

export const userLogin = Joi.object().keys({
  email: Joi.string().required().error(new Error("email is required")),
  password: Joi.string().required().error(new Error("password is required")),
  fcmToken : Joi.string().optional()
});


export const userSignup = Joi.object().keys({
  fullName: Joi.string()
    .required()
    .min(3)
    .max(20)
    .error(new Error("name should be between 3 to 20 characters")),
  referralCode: Joi.string().optional(),
  email: Joi.string().email().error(new Error("Valid email id is required")),
  phone: Joi.string().required().error(new Error("phone number is required")),
  countryCode: Joi.string().required().error(new Error("country code is required")),
  gender: Joi.string().valid("male", "female").required().error(new Error("gender is required")),
  role: Joi.string().valid(RENTER, LANDLORD, PROPERTY_MANAGER).required().error(new Error("Role should be valid")),
  password: Joi.string()
    .optional()
    .alphanum()
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

// export const registerEngineer = Joi.object().keys({
//   active: Joi.boolean().optional(),
//   fullName: Joi.string(),
//   phone: Joi.string(),
//   countryCode: Joi.string(),
//   email: Joi.string().email().error(new Error("Valid email id is required")),
//   address: address.append(),
//   bio: Joi.string(),
//   categoryIds: Joi.array().optional().items(Joi.string().guid().required()),
//   serviceIds: Joi.array().optional().items(Joi.string().guid().required()),
//   documents: Joi.array().items({
//     documentName: Joi.string().required(),
//     filePath: Joi.string().uri().required(),
//     fileType: Joi.string().required(),
//   }),
//   profilePic: Joi.string().optional().allow(null),
// });

// export const updateUser = signup_User.append().keys({
//   active: Joi.boolean().optional(),
//   bio: Joi.string().optional(),
//   fullName: Joi.string().min(3).max(100).optional(),
//   password: Joi.string().alphanum().min(6).optional(),
//   sendOtp: Joi.string().valid("phone", "email").optional(),
//   countryCode: Joi.string().allow(null).optional(),
//   phone: Joi.string().allow("").optional(),
//   profilePic: Joi.string().allow("").optional(),
//   geoLocation: Joi.array().items(Joi.number()).optional(),
//   deviceToken: Joi.string().optional(),
//   dob: Joi.string().allow(null).optional(),
//   role: Joi.string().allow(null).optional(),
//   isActive: Joi.boolean().allow(null).default(true).optional(),
//   sendNotifications: Joi.boolean().allow(null).default(true).optional(),
//   sendOffers: Joi.boolean().allow(null).default(true).optional(),
//   osType: Joi.string()
//     .valid("android", "ios")
//     .error(new Error("Valid os type is required (android / ios)"))
//     .optional(),
//   firstName: Joi.string()
//     .min(3)
//     .max(100)
//     .error(new Error("First name is required"))
//     .optional(),
//   lastName: Joi.string()
//     .min(3)
//     .max(100)
//     .error(new Error("Last name is required"))
//     .optional(),
//   email: Joi.string()
//     .email()
//     .error(new Error("Valid email id is required"))
//     .optional(),
//   address: address.append(),
// });

// export const socialAuth = Joi.object().keys({
//   fullName: Joi.string()
//     .min(3)
//     .max(100)
//     .error(new Error("Min 3 and max 100 letters are allowed in full name")),
//   profilePic: Joi.string().allow(""),
//   email: Joi.string().email(),
//   socialType: Joi.string(),
//   socialId: Joi.string(),
//   deviceToken: Joi.string(),
//   osType: Joi.string()
//     .valid("android", "ios")
//     .error(new Error("Valid os type is required (android / ios)")),
//   role: Joi.string()
//     .valid("user", "engineer")
//     .required()
//     .error(new Error('User role could be "user" or "engineer"')),
// });

// export const searchEngineers = pagination.append().keys({
//   id: Joi.string().guid(),
//   searchableIds: Joi.array().required().items(Joi.string().guid().required()),
// });

// export const availableEngineers = pagination
//   .append()
//   .keys({
//     searchableIds: Joi.array().items(Joi.string().guid().required()),
//     searchString: Joi.string(),
//     timeSlot: Joi.date().required(),
//     sendAll: Joi.boolean().default(false),
//   })
//   .or("searchableIds", "searchString");

// export const preferredEngineers = pagination.append().keys({
//   searchableIds: Joi.array().items(Joi.string().guid()),
// });

// export const updatePreferredEngineer = Joi.object().keys({
//   engineerId: Joi.string().guid().required(),
// });

// export const addReviews = Joi.object().keys({
//   engineerId: Joi.string()
//     .guid()
//     .required()
//     .error(new Error("engineerId is required")),
//   jobId: Joi.string().guid().required().error(new Error("jobId is required")),
//   title: Joi.string().required().error(new Error("title is required")),
//   rating: Joi.number()
//     .positive()
//     .min(0)
//     .max(5)
//     .required()
//     .error(new Error("rating is required")),
//   review: Joi.string().optional(),
//   type: Joi.string()
//     .required()
//     .valid("feedback", "dispute")
//     .error(new Error("type: `feedback` | `dispute` is required")),
// });

// export const getReviews = pagination.append();
