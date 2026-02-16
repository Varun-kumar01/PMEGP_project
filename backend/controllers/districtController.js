import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const createToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId, role: "district" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};


export const registerDistrictUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please provide username and password" });
  }

  try {

    const userQuery = "SELECT * FROM district_login WHERE username = ?";
    const [existingUsers] = await db.query(userQuery, [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const insertQuery = "INSERT INTO district_login (username, password) VALUES (?, ?)";
    const [result] = await db.query(insertQuery, [username, hashedPassword]);

    if (result.affectedRows === 1) {
      const newUserId = result.insertId;

      const token = createToken(res, newUserId);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
      });
    } else {
      throw new Error("Failed to create user");
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};


export const districtLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = "SELECT * FROM employee_login WHERE username = ?";

    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username" });
    }

    const user = results[0];
    
 
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }


    const token = createToken(res, user.id);

    res.json({
      success: true,
      message: "District login successful",
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
