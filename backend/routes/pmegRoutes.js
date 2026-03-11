import express from "express";
import multer from "multer";

import { 
  getPmegData, 
  uploadPmegData, 
  uploadAgencyDetailData,
  getDistrictData,          
  uploadKvibData,
  getDateRange
} from "../controllers/pmegController.js";

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get("/", getPmegData);

router.get("/date-range", getDateRange);

router.post("/upload", upload.single("mainExcel"), uploadPmegData);


router.post("/upload-detail", upload.single("file"), uploadAgencyDetailData);


router.get("/data/:district", getDistrictData);


router.post("/upload-kvib", upload.single("kvibFile"), uploadKvibData);

export default router;
