import express from "express";
import multer from "multer";
import db from "../config/db.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/projects",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("PDF only"));
  }
});

/* Upload project */
// router.post("/upload", upload.single("pdf"), (req, res) => {

//     console.log("Triggered uploading projects /////////////////////")
//   const { title, cost } = req.body;
//   const file = req.file.filename;

//   db.query(
//     "INSERT INTO projects (title, cost, file_name) VALUES (?, ?, ?)",
//     [title, cost, file],
//     err => {
//       if (err) return res.status(500).json(err);
//       res.json({ success: true });
//     }
//   );
// });

router.post("/upload", upload.single("pdf"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { title, cost } = req.body;
    const file = req.file.filename;

    // 🔥 THIS is the critical change
    await db.query(
      "INSERT INTO projects (title, cost, file_name) VALUES (?, ?, ?)",
      [title, cost, file]
    );

    return res.status(200).json({
      success: true,
      message: "Project uploaded successfully"
    });

  } catch (err) {

    console.error("UPLOAD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Database error"
    });

  }

});



/* Fetch projects */
router.get("/", async (req, res) => {
  try {

    console.log("triggered from getting");

    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY id DESC"
    );

    res.status(200).json(rows);

  } catch (err) {

    console.error("FETCH PROJECTS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects"
    });
  }
});


export default router;
