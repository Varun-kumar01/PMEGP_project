
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const registerEmployee = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  try {

    const userQuery = "SELECT * FROM employee_login WHERE username = ?";

    const [existingUsers] = await db.query(userQuery, [username]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const insertQuery = "INSERT INTO employee_login (username, password) VALUES (?, ?)";
    const [result] = await db.query(insertQuery, [username, hashedPassword]);


    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      userId: result.insertId
    });

  } catch (error) {

    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};



export const employeeLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

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

  
    const token = jwt.sign(
      { id: user.id, username: user.username, role: "employee" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

 
    res.json({
      success: true,
      message: "Employee login successful",
      token,
    });

  } catch (error) {

    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

