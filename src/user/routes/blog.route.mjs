import express from 'express';
const router = express.Router();
import * as blogController from "../controllers/blogs.controller.mjs"

router.get("/blog", blogController.getBlogById)
// router.get("/messages", blogController.getMessages)


export default router
