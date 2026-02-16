
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import reportRoutes from "./routes/reportRoutes.js";
import pmegRoutes from "./routes/pmegRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import districtRoutes from "./routes/districtRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import ceoRoutes from "./routes/ceo_loginRouters.js";
import dcoRoutes from "./routes/dco_loginRoutes.js";
import kgmvRoutes from "./routes/kgmv_loginRoutes.js";
import district_mandalsRoutes from "./routes/district_mandalsRoutes.js";

import verificationRoutes from "./routes/verificationRoutes.js";

import cbcDataRoutes from "./routes/cbc_data_tableRoutes.js";

import cbcVerificationRoutes from "./routes/cbc_verificationRoutes.js";

import cbcVerifiedReportRoutes from "./routes/cbc_verified_reportRoutes.js";

import kvibDashboardRoutes from './routes/kvib_dashboardRoutes.js';

import projectRoutes from "./routes/projectRoutes.js";




dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// app.use(express.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Skip body parsing for multipart/form-data (multer will handle it)
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: "50mb" })(req, res, next);
});

app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  bodyParser.urlencoded({ extended: true, limit: "50mb" })(req, res, next);
});



const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot);
}

const uploadWorkingPath = path.join(uploadsRoot, "working_photos");
if (!fs.existsSync(uploadWorkingPath)) {
  fs.mkdirSync(uploadWorkingPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsRoot));

app.use("/api/report", reportRoutes);

app.use("/api/pmeg-data", pmegRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/district", districtRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/ceo", ceoRoutes);
app.use("/api/dco", dcoRoutes);
app.use("/api/kgmv", kgmvRoutes);
app.use("/api/district_mandals", district_mandalsRoutes);
app.use("/api", cbcVerificationRoutes);

app.use("/api/verification", verificationRoutes);

app.use("/api/cbc-data", cbcDataRoutes);

app.use("/api", cbcVerifiedReportRoutes);


app.get("/", (req, res) => {
  res.send("✅ PMEGP Backend Running Successfully!");
});

app.use('/api/kvib-dashboard', kvibDashboardRoutes);

app.use("/api/projects", projectRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🖼 Uploaded files available at http://localhost:${PORT}/uploads/`);
});
