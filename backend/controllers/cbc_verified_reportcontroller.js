import pool from '../config/db.js';

export const getCbcVerifiedReport = async (req, res) => {
  try {
    const { district } = req.query;

    if (!district) {
      return res.status(400).json({ success: false, message: 'District is required' });
    }

    const sql = `
      SELECT 
        -- Main Data (cbc_verified_data)
        c.name_of_borrower AS applicant_name,
        c.name_of_borrower AS applicant_id, -- Using name as ID since it is the Primary Key
        c.mandal,
        c.district,
        c.village AS unit_address,
        c.name_of_industry AS industry_activity,
        c.year_of_sanction,
        c.sanctioned_mm,
        c.sanctioned_total,
        c.final_status,

        -- Working Details (cbc_unit_working_details)
        w.unit_name,
        w.sector,
        w.products_and_cost AS products_manufactured,
        w.marketing_strategy,
        w.employees_engaged AS employees_count,
        w.total_production_annual,
        w.value_of_production_annual,
        w.annual_turnover,
        w.latitude AS working_latitude,
        w.longitude AS working_longitude,
        w.photo_paths AS working_photos,

        -- Not Working Details (cbc_unit_not_working_details)
        nw.remarks AS not_working_remarks,
        nw.latitude AS not_working_latitude,
        nw.longitude AS not_working_longitude,
        nw.photo_paths AS not_working_photos

      FROM cbc_verified_data c
      LEFT JOIN cbc_unit_working_details w ON c.name_of_borrower = w.borrower_name
      LEFT JOIN cbc_unit_not_working_details nw ON c.name_of_borrower = nw.borrower_name
      WHERE c.district = ?
      ORDER BY c.name_of_borrower ASC
    `;

    const [rows] = await pool.execute(sql, [district]);

    res.json({ success: true, data: rows });

  } catch (error) {
    console.error('Error fetching CBC Verified Report:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};