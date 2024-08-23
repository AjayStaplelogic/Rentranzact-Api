import express from "express";
const router = express.Router();
import { addRentApplication, rentApplications, rentApplicationUpdate, getRentApplications, rentApplicationsByID, editRentApplication, getAllRentApplications } from "../controllers/rentApplication.controller.mjs";
import multer from "multer";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import path from "path";
import fs from "fs";
const baseUploadPath = "uploads/RentApplicationDocs";
const hostUrl = process.env.HOST_URL.replace(/^"(.*)"$/, "$1"); // Removes surrounding quotes


router.post(
  "/rentApplication",
  authorizer([UserRoles.RENTER]), addRentApplication
);
router.get('/rentApplications', authorizer([UserRoles.RENTER, UserRoles.LANDLORD , UserRoles.PROPERTY_MANAGER]), rentApplications);

router.get('/rentApplications/:id', authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), rentApplicationsByID);


router.post("/rentApplication/update-status",
  authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]),
  rentApplicationUpdate
)

router.get("/rent-applications/:id", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getRentApplications)

router.put("/rentApplication",authorizer([UserRoles.RENTER]),editRentApplication)

router.get('/rent-application/list', authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), getAllRentApplications);


export default router;
