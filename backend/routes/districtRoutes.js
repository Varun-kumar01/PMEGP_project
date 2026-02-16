import express from "express";
import { districtLogin, registerDistrictUser } from "../controllers/districtController.js";

const router = express.Router();

router.post("/login", districtLogin);
router.post("/register", registerDistrictUser);

export default router;
