import express from 'express'
const router = express.Router();
import {properties} from "../controllers/properties.controller.mjs"

router.get('/properties' , properties )

export default router;

