import express from 'express'
const router = express.Router();
import * as SiteContentController from "../controllers/sitecontents.controlller.mjs"

// Define routes for site content
router.post('/site/content',SiteContentController.addUpdateSiteContent);
router.get('/site/content/slug', SiteContentController.getSiteContentBySlug);



export default router;

