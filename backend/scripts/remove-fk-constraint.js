import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function removeForeignKeyConstraint() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 Checking current foreign key constraints...');
    const [constraints] = await conn.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_master'
    `, [process.env.DB_NAME]);
    
    console.log('Current constraints:', constraints);
    

    const fkName = 'verification_master_ibfk_1';
    console.log(`\n🗑️  Removing foreign key constraint: ${fkName}`);
    
    try {
      await conn.query(`ALTER TABLE verification_master DROP FOREIGN KEY ${fkName}`);
      console.log(`✅ Foreign key constraint '${fkName}' removed successfully!`);
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.warn(`⚠️  Constraint '${fkName}' does not exist. Continuing...`);
      } else {
        throw err;
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error during migration:', err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

removeForeignKeyConstraint();
