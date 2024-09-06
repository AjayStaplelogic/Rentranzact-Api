import express from 'express'
const router = express.Router();
import * as BannerController from "../controllers/banners.controller.mjs"
import * as BannerServices from "../services/banner.service.mjs"

// Define routes for banners
router.post('/banner', BannerServices.upload.single("file"), BannerController.addBanner);
router.put('/banner', BannerServices.upload.single("file"), BannerController.editBanner);
router.get('/banners', BannerController.getAllBanners);
router.get('/banner', BannerController.getBannerById);
router.delete('/banner', BannerController.deleteBanner);


export default router;

