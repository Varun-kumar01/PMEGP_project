import bcrypt from 'bcrypt';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const updateUserPassword = async () => {
  const userData = {
    username: 'user1',
    password: '123' 
  };

  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);


    const updateUserSQL = `
      UPDATE district_login 
      SET password = ?
      WHERE username = ?
    `;


    db.query(updateUserSQL, [hashedPassword, userData.username], (err, result) => {
      if (err) {
        console.error('Error updating user password:', err);
        process.exit(1);
      }
      
      if (result.affectedRows === 0) {
        console.log('No user found with username:', userData.username);
        process.exit(1);
      }

      console.log('User password updated successfully!');
      console.log('Username:', userData.username);
      console.log('New password hash:', hashedPassword);
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateUserPassword();