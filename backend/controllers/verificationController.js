
import db from "../config/db.js";

export const submitVerification = async (req, res) => {
  try {
    const {
      applicant_id,
      applicant_name,
      district,
      mandal,
      village,
      product_desc_activity,
      unit_address,
      working_status,
      not_working_status,
      shifted_status
    } = req.body;

    if (!applicant_id) {
      return res.status(400).json({ error: "applicant_id is required" });
    }

    const norm = (v) => (v === "YES" || v === "NO" ? v : null);
    const w = norm(working_status);
    const nw = norm(not_working_status);
    const s = norm(shifted_status);

    const sql = `
      INSERT INTO applicant_verifications
        (applicant_id, applicant_name, district, mandal, village,
         product_desc_activity, unit_address,
         working_status, not_working_status, shifted_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        applicant_name = VALUES(applicant_name),
        district = VALUES(district),
        mandal = VALUES(mandal),
        village = VALUES(village),
        product_desc_activity = VALUES(product_desc_activity),
        unit_address = VALUES(unit_address),
        working_status = VALUES(working_status),
        not_working_status = VALUES(not_working_status),
        shifted_status = VALUES(shifted_status),
        updated_at = CURRENT_TIMESTAMP
    `;

    await db.execute(sql, [
      applicant_id,
      applicant_name || null,
      district || null,
      mandal || null,
      village || null,
      product_desc_activity || null,
      unit_address || null,
      w,
      nw,
      s
    ]);

    return res.json({ message: "Verification status saved" });
  } catch (err) {
    console.error("submitVerification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const submitWorkingDetails = async (req, res) => {
  try {
    const parsed = req.body.data ? JSON.parse(req.body.data) : req.body;
    

    const { applicant_id, working_form, latitude, longitude } = parsed;

    if (!applicant_id) return res.status(400).json({ error: "Applicant ID missing" });


    await db.execute(
      "INSERT IGNORE INTO applicant_verifications (applicant_id) VALUES (?)",
      [applicant_id]
    );

    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map((f) => f.path);
    }

    const sql = `
      INSERT INTO verification_working_details
      (applicant_id, unit_sector, unit_name, products_cost, marketing_scope,
       employee_count, annual_production_qty, annual_production_value, annual_turnover, 
       photo_paths, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        unit_sector = VALUES(unit_sector),
        unit_name = VALUES(unit_name),
        products_cost = VALUES(products_cost),
        marketing_scope = VALUES(marketing_scope),
        employee_count = VALUES(employee_count),
        annual_production_qty = VALUES(annual_production_qty),
        annual_production_value = VALUES(annual_production_value),
        annual_turnover = VALUES(annual_turnover),
        photo_paths = VALUES(photo_paths),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude)
    `;

    await db.execute(sql, [
      applicant_id,
      working_form.unit_sector || null,
      working_form.unit_name || null,
      working_form.products_cost || null,
      working_form.marketing || null,
      working_form.employees || null,
      working_form.annual_production || null,
      working_form.production_value || null,
      working_form.annual_turnover || null,
      JSON.stringify(photoPaths),
      latitude || null, 
      longitude || null  
    ]);

    return res.json({ message: "Working details saved", photos: photoPaths.length });
  } catch (err) {
    console.error("submitWorkingDetails error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const submitNotWorkingDetails = async (req, res) => {
  try {
    const parsed = req.body.data ? JSON.parse(req.body.data) : req.body;
    

    const { applicant_id, remarks, latitude, longitude } = parsed;

    if (!applicant_id) return res.status(400).json({ error: "Applicant ID missing" });


    await db.execute(
      "INSERT IGNORE INTO applicant_verifications (applicant_id) VALUES (?)",
      [applicant_id]
    );

    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map((f) => f.path);
    }

    const sql = `
      INSERT INTO verification_not_working_details
        (applicant_id, remarks, photo_paths, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        remarks = VALUES(remarks),
        photo_paths = VALUES(photo_paths),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude)
    `;

    await db.execute(sql, [
      applicant_id, 
      remarks || null, 
      JSON.stringify(photoPaths),
      latitude || null,
      longitude || null 
    ]);

    return res.json({ message: "Not working details saved", photos: photoPaths.length });
  } catch (err) {
    console.error("submitNotWorkingDetails error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const submitShiftedDetails = async (req, res) => {
  try {
    const parsed = req.body.data ? JSON.parse(req.body.data) : req.body;
    
  
    const { applicant_id, new_address, latitude, longitude } = parsed;

    if (!applicant_id) return res.status(400).json({ error: "Applicant ID missing" });
    if (!new_address) return res.status(400).json({ error: "New address is required" });


    await db.execute(
      "INSERT IGNORE INTO applicant_verifications (applicant_id) VALUES (?)",
      [applicant_id]
    );


    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map((f) => f.path);
    }

    const sql = `
      INSERT INTO verification_shifted_details
        (applicant_id, new_address, photo_paths, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        new_address = VALUES(new_address),
        photo_paths = VALUES(photo_paths),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude)
    `;

    await db.execute(sql, [
      applicant_id, 
      new_address,
      JSON.stringify(photoPaths),
      latitude || null, 
      longitude || null 
    ]);

    return res.json({ message: "Shifted details saved" });
  } catch (err) {
    console.error("submitShiftedDetails error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};