import express from "express";
import { kgmvLogin, registerKgmvUser } from "../controllers/kgmv_loginController.js";

const router = express.Router();

router.post("/login", kgmvLogin);
router.post("/register", registerKgmvUser);

export default router;
