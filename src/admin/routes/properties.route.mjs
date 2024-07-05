import express from 'express'
const router = express.Router();
import {properties , property} from "../controllers/properties.controller.mjs"

router.get('/properties' , properties )
router.get('/property/:id', property)

export default router;

