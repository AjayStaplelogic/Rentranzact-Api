import express from 'express'
const router = express.Router();
import {properties , property , deleteProperty , leaseAggrements} from "../controllers/properties.controller.mjs"

router.get('/properties' , properties )
router.get('/property/:id', property)
router.delete('/property/:id', deleteProperty)
router.get("/lease-agreements", leaseAggrements)

export default router;

