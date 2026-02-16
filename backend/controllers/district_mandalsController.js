

import db from "../config/db.js";


export const getDistricts = async (req, res) => {
  try {
    const sql = "SELECT id, name FROM districts ORDER BY name";
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Error loading districts:", err);
    res.status(500).json({ message: "Database Error", error: err });
  }
};


export const getMandals = async (req, res) => {
  try {
    const districtId = req.query.districtId;

    if (!districtId) {
      return res.status(400).json({ message: "District ID is required" });
    }

    const sql = `
      SELECT name 
      FROM mandals 
      WHERE district_id = ?
      ORDER BY name
    `;

    const [results] = await db.query(sql, [districtId]);
    res.json(results);
  } catch (err) {
    console.error("Error loading mandals:", err);
    res.status(500).json({ message: "Database Error", error: err });
  }
};


// export const getTotalDistrictData = async (req, res) => {
//   try {
//     console.log("triggered by pemegp");

//     let { district, mandal } = req.query;

//     console.log("**************")
//     console.log(district)
//     console.log(mandal)
    
//     if (!district || !mandal) {
//       return res.status(400).json({
//         message: "District and Mandal are required"
//       });
//     }

//     const cleanDistrict = district.trim().toUpperCase();
//     const cleanMandal = mandal.trim().toUpperCase();

    
//     let sql;
//     let params;

//     /* 🔴 SPECIAL CASE: Adilabad / Adilabad Urban */
//     if (
//       cleanMandal === cleanDistrict ||
//       cleanMandal === `${cleanDistrict} URBAN`
//     ) {
//       sql = `
//         SELECT
//           applicant_name,
//           applicant_id,
//           product_desc_activity,
//           unit_address,
//           taluk_block,
//           unit_district
//         FROM total_district_data
//         WHERE UPPER(TRIM(unit_district)) = ?
//           AND UPPER(TRIM(taluk_block)) LIKE ?
//       `;

//       params = [
//         cleanDistrict,
//         `%${cleanMandal}%`
//       ];
//     } 
//     /* 🟢 NORMAL CASE: Bela, Bheempoor, etc. */
//     else {
//       sql = `
//         SELECT
//           applicant_name,
//           applicant_id,
//           product_desc_activity,
//           unit_address,
//           taluk_block,
//           unit_district
//         FROM total_district_data
//         WHERE UPPER(TRIM(unit_district)) = ?
//           AND TRIM(
//                 REPLACE(
//                   REPLACE(
//                     REPLACE(
//                       REPLACE(
//                         REPLACE(UPPER(taluk_block), UPPER(?), ''),
//                       ' MANDAL', ''),
//                     ' DIST', ''),
//                   ' DISTRICT', ''),
//                 '(T)', '')
//               ) LIKE ?
//       `;

//       params = [
//         cleanDistrict,
//         cleanDistrict,
//         `%${cleanMandal}%`
//       ];
//     }

//     const [results] = await db.query(sql, params);
//      console.log(results)

//     const formatted = results.map(row => ({
//       ...row,
//       village: `${row.taluk_block || ""}, ${row.unit_district || ""}`.trim()
//     }));

//     res.json(formatted);

//   } catch (err) {
//     console.error("Error loading district data:", err);
//     res.status(500).json({
//       message: "Database Error",
//       error: err.message
//     });
//   }
// };


export const getTotalDistrictData = async (req, res) => {
  try {
    const { district, mandal } = req.query;

    if (!district) {
      return res.status(400).json({ message: "District is required" });
    }

    let sql = `
      SELECT
        applicant_name,
        applicant_id,
        product_desc_activity,
        unit_address,
        taluk_block,
        unit_district
      FROM total_district_data
      WHERE UPPER(TRIM(unit_district)) = UPPER(TRIM(?))
    `;

    const params = [district];

    if (mandal && mandal.trim() !== '') {
      sql += ` AND UPPER(taluk_block) LIKE CONCAT('%', UPPER(?), '%')`;
      params.push(mandal);
    }

    const [rows] = await db.query(sql, params);

    res.json(rows.map(r => ({
      ...r,
      village: `${r.taluk_block}, ${r.unit_district}`
    })));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

