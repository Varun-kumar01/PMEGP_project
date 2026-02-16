import express from "express";

import { stateLogin, registerStateUser } from "../controllers/stateController.js";

const router = express.Router();

router.post("/login", stateLogin);

router.post("/register", registerStateUser);

export default router;