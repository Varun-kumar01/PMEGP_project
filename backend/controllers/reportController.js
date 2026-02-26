
import pool from '../config/db.js'; 


export const getFullVerificationReport = async (req, res) => {
  try {
    const { district, mandal } = req.query;
    if (!district) {
      return res.status(400).json({ success: false, message: 'district required' });
    }

    let sql = `
      SELECT
        t.applicant_id,
        t.applicant_name,
        t.product_desc_activity,
        t.unit_address,
        t.taluk_block AS mandal,
        t.unit_district AS district,
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
        w.latitude AS working_latitude,
        w.longitude AS working_longitude,
        w.photo_paths AS working_photos,
        -- not working
        nw.remarks AS not_working_remarks,
        nw.latitude AS not_working_latitude,
        nw.longitude AS not_working_longitude,
        nw.photo_paths AS not_working_photos,
        -- shifted
        s.new_address AS shifted_new_address,
        s.latitude AS shifted_latitude,
        s.longitude AS shifted_longitude,
        s.photo_paths AS shifted_photos
      FROM total_district_data t
      LEFT JOIN applicant_verifications a ON t.applicant_id = a.applicant_id
      LEFT JOIN verification_working_details w ON t.applicant_id = w.applicant_id
      LEFT JOIN verification_not_working_details nw ON t.applicant_id = nw.applicant_id
      LEFT JOIN verification_shifted_details s ON t.applicant_id = s.applicant_id
      WHERE UPPER(TRIM(t.unit_district)) = UPPER(TRIM(?))
    `;

    const params = [district];

    // Add mandal filter if provided
    if (mandal && mandal.trim() !== '') {
      sql += ` AND UPPER(t.taluk_block) LIKE CONCAT('%', UPPER(?), '%')`;
      params.push(mandal);
    }

    sql += ` ORDER BY t.applicant_name ASC`;

    const [rows] = await pool.execute(sql, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getFullVerificationReport error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
