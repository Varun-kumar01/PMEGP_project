
import express from "express";
import multer from "multer";
import {
  submitVerification,
  submitWorkingDetails,
  submitNotWorkingDetails,
  submitShiftedDetails
} from "../controllers/verificationController.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/verification_photos");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { files: 5 }
});


router.post("/submit", submitVerification);


router.post(
  "/working-details",
  upload.array("working_photos", 5),
  submitWorkingDetails
);


router.post(
  "/not-working-details",
  upload.array("not_working_photos", 5),
  submitNotWorkingDetails
);


router.post(
  "/shifted-details",
  upload.array("shifted_photos", 5),
  submitShiftedDetails
);

export default router;