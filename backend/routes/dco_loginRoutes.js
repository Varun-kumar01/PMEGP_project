import express from "express";
import { dcoLogin, registerDcoUser } from "../controllers/dco_loginController.js";

const router = express.Router();

router.post("/login", dcoLogin);
router.post("/register", registerDcoUser);

export default router;
