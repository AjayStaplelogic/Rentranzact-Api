import express from 'express'
const router = express.Router();
import {properties , property , deleteProperty , leaseAggrements, updateProperty, getAllPropertyList} from "../controllers/properties.controller.mjs"

router.get('/properties' , properties )
router.get('/property/:id', property)
router.delete('/property/:id', deleteProperty)
router.get("/lease-agreements", leaseAggrements)
router.put("/property", updateProperty);
router.get("/properties/all", getAllPropertyList)

export default router;

