import express from "express";
import multer from "multer";

import { 
  getPmegData, 
  uploadPmegData, 
  uploadAgencyDetailData,
  getDistrictData,          
  uploadKvibData
} from "../controllers/pmegController.js";

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get("/", getPmegData);


router.post("/upload", upload.single("mainExcel"), uploadPmegData);


router.post("/upload-detail", upload.single("file"), uploadAgencyDetailData);


router.get("/data/:district", getDistrictData);


router.post("/upload-kvib", upload.single("kvibFile"), uploadKvibData);

export default router;
