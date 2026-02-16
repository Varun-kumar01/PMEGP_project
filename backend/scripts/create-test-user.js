import bcrypt from 'bcrypt';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  const testUser = {
    username: 'testdistrict',
    password: 'test123'  
  };

  try {
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

 
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS district_login (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;


    const insertUserSQL = `
      INSERT INTO district_login (username, password) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE password = ?
    `;


    db.query(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
      }

      db.query(insertUserSQL, [testUser.username, hashedPassword, hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting test user:', err);
          process.exit(1);
        }
        console.log('Test user created successfully!');
        console.log('Username:', testUser.username);
        console.log('Password:', testUser.password);
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();