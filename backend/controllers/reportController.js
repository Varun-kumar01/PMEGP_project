// controllers/reportController.js
import pool from '../config/db.js'; // adjust path to your mysql2 pool export

/**
 * GET /api/report/verification/full-report?district=...&mandal=...
 * returns merged rows
 */
export const getFullVerificationReport = async (req, res) => {
  try {
    const { district, mandal } = req.query;
    if (!district) {
      return res.status(400).json({ success: false, message: 'district is required' });
    }

    const sql = `
      SELECT
        a.applicant_id,
        a.applicant_name,
        a.mandal,
        a.district,
        a.product_desc_activity,
        a.unit_address,
        a.working_status,
        a.not_working_status,
        a.shifted_status,
        -- working details
        w.unit_sector,
        w.unit_name,
        w.products_cost,
        w.marketing_scope,
        w.employee_count,
        w.annual_production_qty,
        w.annual_production_value,
        w.annual_turnover,
        w.photo_paths AS working_photos,
        -- not working
        nw.remarks AS not_working_remarks,
        nw.photo_paths AS not_working_photos,
        -- shifted
        s.new_address AS shifted_new_address
      FROM applicant_verifications a
      LEFT JOIN verification_working_details w ON a.applicant_id = w.applicant_id
      LEFT JOIN verification_not_working_details nw ON a.applicant_id = nw.applicant_id
      LEFT JOIN verification_shifted_details s ON a.applicant_id = s.applicant_id
      WHERE a.district = ?
      ${mandal ? 'AND a.mandal LIKE ?' : ''}
      ORDER BY a.applicant_name ASC
    `;

    const params = [district];
    if (mandal) {
      params.push(`%${mandal}%`);
    }
    const [rows] = await pool.execute(sql, params);

    // rows might contain photo_paths as JSON strings - send as-is; client will normalize
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getFullVerificationReport error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
