import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function removeForeignKeys() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    const tables = [
      'working_unit_verification',
      'not_working_verification',
      'shifted_unit_verification'
    ];
    
    for (const table of tables) {
      try {
        console.log(`\n🔍 Checking ${table} for foreign keys...`);
        
        const [fks] = await conn.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = ? 
          AND REFERENCED_TABLE_NAME = 'applicants_base'
        `, [process.env.DB_NAME, table]);
        
        if (fks.length > 0) {
          for (const fk of fks) {
            console.log(`🗑️  Removing ${fk.CONSTRAINT_NAME} from ${table}...`);
            await conn.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
            console.log(`✅ Removed FK from ${table}: ${fk.CONSTRAINT_NAME}`);
          }
        } else {
          console.log(`⚠️  No FK constraints found on ${table}`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${table}:`, err.message);
      }
    }
    
    console.log('\n✅ Foreign key removal completed!');
    conn.release();
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

removeForeignKeys();
