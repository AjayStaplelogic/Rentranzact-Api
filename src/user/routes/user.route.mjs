import express from 'express'
const router = express.Router();
import {
    wallet, login, signup, userVerification, socialLogin, myprofile, forgotPassword, favourites, uploadLeaseAggrement, getLeaseAggrements, deleteAggrement, userOtpVerification, resetPassword, editMyProfile,
    teriminateRenter,
    commisions,
    getUserDetails,
    deleteUser,
    switchRole,
    shareReferralCode,
    verifyReferralCode
} from '../controllers/user.controller.mjs'
import { resendOTP } from '../controllers/resendOtp.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import multer from 'multer';
import path from "path"
import fs from "fs";
import * as s3Service from "../services/s3.service.mjs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
import { fileURLToPath } from 'url';
const baseUploadPath = "uploads/";

const hostUrl = process.env.HOST_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const documentDir = path.join(baseUploadPath, "LeaseAggrements");
        if (!fs.existsSync(documentDir)) {
            fs.mkdirSync(documentDir);
        }
        let destinationFolder = documentDir;

        cb(null, destinationFolder);
    },

    filename: function (req, file, cb) {

        // const ext = path.extname(file.originalname); // Get the file extension
        // const randomFileName = req.user.data._id + req.user.data.role + ext;
        const randomFileName = generateRandomFileName(file);

        cb(null, randomFileName);
    },
});

const upload = multer({ storage: storage });

router.post('/signup', signup);

router.post('/otpVerification', userVerification)

router.post('/login', login);

router.post('/socialLogin', socialLogin)

router.post('/resendOtp', resendOTP)

router.get("/my-profile", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), myprofile)

router.post("/forgot-password", forgotPassword)

router.get("/favorites", authorizer([UserRoles.RENTER]), favourites)

router.post("/lease-aggrement", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), upload.single('document'), async (req, res) => {
    const randomFileName = req.file.filename;
    const relativePath = path.resolve(__dirname, '..', '..', '..', "uploads", "LeaseAggrements", randomFileName)
    await s3Service.uploadFile(relativePath, `lease-aggrements/${req.body.propertyID.toString()}/${randomFileName}`, req?.file?.mimetype)
    req.documents = `${process.env.BUCKET_BASE_URL}/lease-aggrements/${req.body.propertyID.toString()}/${randomFileName}`;
    uploadLeaseAggrement(req, res);
})

router.get("/lease-aggrements", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), getLeaseAggrements)

router.delete("/lease-aggerment/:id", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), deleteAggrement)

router.get("/wallet", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), wallet)

router.post("/verify-otp", userOtpVerification)

router.post("/reset-password", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), resetPassword)

router.put("/my-profile", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), editMyProfile)

router.get("/terminate-renter/:id", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), teriminateRenter)

router.get("/commisions", authorizer([UserRoles.PROPERTY_MANAGER]), commisions)

router.get("/user", authorizer([UserRoles.PROPERTY_MANAGER, UserRoles.LANDLORD, UserRoles.RENTER]), getUserDetails)

router.delete("/delete/user", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]), deleteUser)

router.post('/switch-role', authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]), switchRole);

router.post("/refer", authorizer([UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER, UserRoles.RENTER]), shareReferralCode);
router.post("/verify/referral-code", verifyReferralCode);

export default router;
