import express from 'express'
const router = express.Router();
import { wallet, login, signup, userVerification, socialLogin, myprofile, forgotPassword, favourites, uploadLeaseAggrement, getLeaseAggrements, deleteAggrement, userOtpVerification, resetPassword } from '../controllers/user.controller.mjs'
import { resendOTP } from '../controllers/resendOtp.controller.mjs';
import { UserRoles } from '../enums/role.enums.mjs';
import authorizer from '../middleware/authorizer.middleware.mjs';
import multer from 'multer';
import path from "path"
import fs from "fs";

const baseUploadPath = "uploads/";

const hostUrl = process.env.HOST_URL;

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

        const ext = path.extname(file.originalname); // Get the file extension
        const randomFileName = req.user.data._id + req.user.data.role + ext;
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

router.post("/lease-aggrement", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), upload.single('document'), (req, res) => {

    const fileName = req.user.data._id;

    const relativePath = path.join(hostUrl, "property", "LeaseAggrements", fileName + req.user.data.role + ".pdf")

    // console.log(relativePath, "===relative path")

    req.documents = relativePath;
    uploadLeaseAggrement(req, res);
})

router.get("/lease-aggrements", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), getLeaseAggrements)

router.delete("/lease-aggerment/:id", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), deleteAggrement)

router.get("/wallet", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), wallet)

router.post("/verify-otp", userOtpVerification)

router.post("/reset-password", authorizer([UserRoles.RENTER, UserRoles.LANDLORD]), resetPassword)



export default router;
