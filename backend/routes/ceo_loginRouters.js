import express from "express";
import { ceoLogin, registerCeoUser } from "../controllers/ceo_loginController.js";

const router = express.Router();

router.post("/login", ceoLogin);
router.post("/register", registerCeoUser);

export default router;
