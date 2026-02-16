import db from "../config/db.js";
import bcrypt from "bcrypt";


export const registerKgmvUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please provide username and password" });
  }

  try {

    const userQuery = "SELECT * FROM employee_login WHERE username = ?";
    const [existingUsers] = await db.query(userQuery, [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const insertQuery = "INSERT INTO kgmv_login (username, password) VALUES (?, ?)";
    const [result] = await db.query(insertQuery, [username, hashedPassword]);

    if (result.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: "Registration successful",
      });
    } else {
      throw new Error("Failed to create user");
    }
  } catch (error) {
    console.error('KGMV Registration error:', error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};


export const kgmvLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  const query = "SELECT * FROM employee_login WHERE username = ?";
  
  try {
    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true,
      message: "KGMV login successful",
    });

  } catch (err) {
    console.error("Database error in kgmvLogin:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};
