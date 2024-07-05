import express from 'express'
const router = express.Router();
import {properties , property , deleteProperty} from "../controllers/properties.controller.mjs"

router.get('/properties' , properties )
router.get('/property/:id', property)
router.delete('/property/:id', deleteProperty)

export default router;

