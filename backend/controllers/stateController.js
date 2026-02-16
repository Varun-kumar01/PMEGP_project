import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const createStateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId, role: "state" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};



export const registerStateUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please provide username and password" });
  }

  try {

    const userQuery = "SELECT * FROM state_login WHERE username = ?";
    const [existingUsers] = await db.query(userQuery, [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const insertQuery = "INSERT INTO state_login (username, password) VALUES (?, ?)";
    const [result] = await db.query(insertQuery, [username, hashedPassword]);

    if (result.affectedRows === 1) {
      const newUserId = result.insertId;
      const token = createStateToken(res, newUserId);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
      });
    } else {
      throw new Error("Failed to create user");
    }
  } catch (error) {
    console.error('State Registration error:', error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};


export const stateLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  const query = "SELECT * FROM state_login WHERE username = ?";
  
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

    const token = createStateToken(res, user.id);

    res.json({
      success: true,
      message: "State login successful",
      token,
    });

  } catch (err) {
    console.error("Database error in stateLogin:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};