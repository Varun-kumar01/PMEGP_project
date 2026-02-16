
import express from "express";

import { employeeLogin, registerEmployee } from "../controllers/employeeController.js";

const router = express.Router();


router.post("/register", registerEmployee);


router.post("/login", employeeLogin);

export default router;
