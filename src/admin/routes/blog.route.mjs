import express from 'express'
const router = express.Router();
import * as BlogController from "../controllers/blogs.controller.mjs"
import * as blogServices from "../services/blog.service.mjs"

// Define routes for users
router.post('/blog', blogServices.upload.single("file"), BlogController.addBlog);
router.put('/blog', blogServices.upload.single("file"), BlogController.editBlog);
router.get('/blogs', BlogController.getAllBlogs);
router.get('/blog', BlogController.getBlogById);
router.delete('/blog', BlogController.deleteBlog);


export default router;

