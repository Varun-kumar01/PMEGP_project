

import express from "express";
import {
  getDistricts,
  getMandals,
  getTotalDistrictData
} from "../controllers/district_mandalsController.js";

const router = express.Router();


router.get("/districts", getDistricts);


router.get("/mandals", getMandals);


router.get("/verification/total-district-data", getTotalDistrictData);

export default router;
