import db from '../config/db.js';

/**
 * GLANCE TITLES TO DATABASE MAPPING
 * ==========================================
 * All glance titles map to the 'pmeg_data_tables' database table
 * 
 * Field Name                              | Database Table    | Column(s)
 * -----                                   | -----             | -----
 * Target (Phy & Fin)                      | pmeg_data_tables  | target
 * No. of Applications Registered          | pmeg_data_tables  | total_applications
 * No. of Applications Forwarded to Bank   | pmeg_data_tables  | Forwarded_to_Bank
 * Sanctioned by Bank                      | pmeg_data_tables  | sanctionedPrj, sanctionedLakh
 * Claim by Bank                           | pmeg_data_tables  | claimedPrj, claimedLakh
 * Disbursement by KVIC                    | pmeg_data_tables  | disbursementPrj, disbursementLakh
 * Pendency at DCO                         | pmeg_data_tables  | dco_pending
 * Pendency at Bank                        | pmeg_data_tables  | pendingBankPrj, pendingBankLakh
 * Rejected by Bank                        | pmeg_data_tables  | bankReturned
 * Pending at KVIC                         | pmeg_data_tables  | kvic_pending
 * Referred by KVIC                        | pmeg_data_tables  | pendingDisbursementPrj, pendingDisbursementLakh
 * ==========================================
 */

// Map glance titles to database column names
const glanceTitleMap = {
  'No. of Applications Registered': 'total_applications',
  'No. of Applications Forwarded to Bank': 'Forwarded_to_Bank',
  'Sanctioned by Bank': { projects: 'sanctionedPrj', lakh: 'sanctionedLakh' },
  'Claim by Bank': { projects: 'claimedPrj', lakh: 'claimedLakh' },
  'Disbursement by KVIC': { projects: 'disbursementPrj', lakh: 'disbursementLakh' },
  'Pendency at Bank': { projects: 'pendingBankPrj', lakh: 'pendingBankLakh' },
  'Rejected by Bank': 'bankReturned',
  'Pendency at DCO': 'dco_pending',
  'Pending at KVIC': 'kvic_pending',
  'Referred by KVIC': { projects: 'pendingDisbursementPrj', lakh: 'pendingDisbursementLakh' },
  'Target (Phy & Fin)': 'target'
};

export const getGlanceData = async (req, res) => {

  const { year, title } = req.query;

  try {

    // console.log("📊 getGlanceData API called:", { year, title });

    const column = glanceTitleMap[title];

    if (!column) {
      return res.status(400).json({
        success: false,
        message: "Invalid glance title"
      });
    }

    let sql;

    // Case 1: single value columns
    if (typeof column === "string") {

      sql = `
        SELECT 
          name AS district,
          ${column} AS value
        FROM pmeg_data_table
        WHERE year = ?
        ORDER BY name ASC
      `;

    }
    // Case 2: project + lakh columns
    else {

      sql = `
        SELECT 
          name AS district,
          ${column.projects} AS projects,
          ${column.lakh} AS lakh
        FROM pmeg_data_table
        WHERE year = ?
        ORDER BY name ASC
      `;

    }

    // console.log("🔍 Executing SQL:", sql);

    const [rows] = await db.query(sql, [year]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error("❌ getGlanceData error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch glance data",
      error: error.message
    });

  }

};

export const getGlanceYears = async (req, res) => {
  try {
    // console.log('📅 getGlanceYears API called');

    const sql = `
      SELECT DISTINCT year
      FROM pmeg_data_table
      ORDER BY year DESC
    `;

    const [rows] = await db.query(sql);

    // console.log(`✅ Successfully fetched ${rows.length} years from database`);

    res.json({
      success: true,
      years: rows.map(r => r.year)
    });

  } catch (error) {
    console.error('❌ getGlanceYears error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch years'
    });
  }
};