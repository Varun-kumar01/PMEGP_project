import db from "../config/db.js";

export const storeCbcVerifiedData = async (req, res) => {
  try {
    let {
      name_of_borrower,
      district,
      mandal,
      village,
      year_of_sanction,
      name_of_industry,
      sanctioned_mm,
      sanctioned_total,
      final_status 
    } = req.body;
 
    if (!name_of_borrower) {
      return res.status(400).json({ error: "name_of_borrower is required" });
    }

   
    if (year_of_sanction && typeof year_of_sanction === 'string') {
       
      year_of_sanction = year_of_sanction.substring(0, 4);  
      
      if (!/^\d{4}$/.test(year_of_sanction)) {
        year_of_sanction = null;
      }
    }

    const sql = `
      INSERT INTO cbc_verified_data (
        name_of_borrower, 
        district, 
        mandal, 
        village, 
        year_of_sanction, 
        name_of_industry, 
        sanctioned_mm, 
        sanctioned_total, 
        final_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, IFNULL(?, 'Pending'))
      ON DUPLICATE KEY UPDATE
        district = VALUES(district),
        mandal = VALUES(mandal),
        village = VALUES(village),
        year_of_sanction = VALUES(year_of_sanction),
        name_of_industry = VALUES(name_of_industry),
        sanctioned_mm = VALUES(sanctioned_mm),
        sanctioned_total = VALUES(sanctioned_total),
        final_status = VALUES(final_status)
    `;

    const values = [
      name_of_borrower,
      district || null,
      mandal || null,
      village || null,
      year_of_sanction || null,
      name_of_industry || null,
      sanctioned_mm || 0,
      sanctioned_total || 0,
      final_status || null
    ];

    await db.execute(sql, values);

    return res.status(200).json({ message: "CBC Verified Data stored successfully" });

  } catch (err) {
    console.error("Error storing CBC Verified Data:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

 
export const submitCbcWorkingDetails = async (req, res) => {
  try {
   
    const parsed = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    const { 
      borrower_name, 
      district, mandal, village, year, industry, mm, total, 
      working_form, 
      latitude, 
      longitude 
    } = parsed;

    if (!borrower_name) {
      return res.status(400).json({ error: "Borrower Name is required" });
    }

    const masterSql = `
      INSERT IGNORE INTO cbc_verified_data 
      (name_of_borrower, district, mandal, village, year_of_sanction, name_of_industry, sanctioned_mm, sanctioned_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(masterSql, [
      borrower_name, district, mandal, village, year, industry, mm, total
    ]);


    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map((f) => f.path);
    }


    const sql = `
      INSERT INTO cbc_unit_working_details (
        borrower_name, 
        sector, 
        unit_name, 
        products_and_cost, 
        marketing_strategy,
        employees_engaged, 
        total_production_annual, 
        value_of_production_annual, 
        annual_turnover, 
        latitude, 
        longitude, 
        photo_paths
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        sector = VALUES(sector),
        unit_name = VALUES(unit_name),
        products_and_cost = VALUES(products_and_cost),
        marketing_strategy = VALUES(marketing_strategy),
        employees_engaged = VALUES(employees_engaged),
        total_production_annual = VALUES(total_production_annual),
        value_of_production_annual = VALUES(value_of_production_annual),
        annual_turnover = VALUES(annual_turnover),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        photo_paths = VALUES(photo_paths)
    `;


    await db.execute(sql, [
      borrower_name,
      working_form.unit_sector,      
      working_form.unit_name,        
      working_form.products_cost,   
      working_form.marketing,       
      working_form.employees,        
      working_form.annual_production,
      working_form.production_value, 
      working_form.annual_turnover,  
      latitude,
      longitude,
      JSON.stringify(photoPaths)    
    ]);

    return res.status(200).json({ message: "Working details saved successfully" });

  } catch (err) {
    console.error("Error storing Working Details:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};




export const submitCbcNotWorkingDetails = async (req, res) => {
  try {

    const parsed = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    const { 
      borrower_name, 
      district, mandal, village, year, industry, mm, total, 
      remarks, 
      latitude, 
      longitude 
    } = parsed;

    if (!borrower_name) {
      return res.status(400).json({ error: "Borrower Name is required" });
    }

    if (!remarks) {
      return res.status(400).json({ error: "Remarks are required" });
    }


    const masterSql = `
      INSERT IGNORE INTO cbc_verified_data 
      (name_of_borrower, district, mandal, village, year_of_sanction, name_of_industry, sanctioned_mm, sanctioned_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(masterSql, [
      borrower_name, district, mandal, village, year, industry, mm, total
    ]);

    let photoPaths = [];
    if (req.files && req.files.length > 0) {
      photoPaths = req.files.map((f) => f.path);
    }

    const sql = `
      INSERT INTO cbc_unit_not_working_details (
        borrower_name, 
        remarks, 
        latitude, 
        longitude, 
        photo_paths
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        remarks = VALUES(remarks),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        photo_paths = VALUES(photo_paths)
    `;

    await db.execute(sql, [
      borrower_name,
      remarks,
      latitude,
      longitude,
      JSON.stringify(photoPaths) 
    ]);

    return res.status(200).json({ message: "Not Working details saved successfully" });

  } catch (err) {
    console.error("Error storing Not Working Details:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};