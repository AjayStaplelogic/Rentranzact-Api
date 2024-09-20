import express from 'express';
const router = express.Router();
import * as CareerController from "../controllers/careers.controller.mjs"

router.post("/career", CareerController.addCareer)
router.put("/career", CareerController.editCareer)
router.get("/careers", CareerController.getAllCareers)
router.get("/career", CareerController.getCareerById)
router.delete("/career", CareerController.deleteCareerById)
router.get("/career/filters", CareerController.getCareerFiltersData)


export default router
