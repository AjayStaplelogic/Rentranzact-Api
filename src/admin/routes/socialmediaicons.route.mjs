import express from 'express'
const router = express.Router();
import * as SocialMediaIconsController from "../controllers/socialmediaicons.controller.mjs"
import * as SocialMediaIconsServices from "../services/socialmediaicons.service.mjs"

// Define routes for SocialMediaIconss
router.post('/social-media/icon', SocialMediaIconsServices.upload.single("file"), SocialMediaIconsController.addSocialMediaIcon);
router.put('/social-media/icon', SocialMediaIconsServices.upload.single("file"), SocialMediaIconsController.editSocialMediaIcon);
router.get('/social-media/icons', SocialMediaIconsController.getAllSocialMediaIcons);
router.get('/social-media/icon', SocialMediaIconsController.getSocialMediaIconById);
router.delete('/social-media/icon', SocialMediaIconsController.deleteSocialMediaIcon);


export default router;

