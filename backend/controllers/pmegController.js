import db from "../config/db.js";
import ExcelJS from "exceljs";


const getCellVal = (cell) => {
  if (!cell || cell.value === null || cell.value === undefined) return null;

  let value = cell.value;


  if (typeof value === "object") {

    if (value.richText) {
      value = value.richText.map(rt => rt.text).join("");
    }

    else if (value.result !== undefined && value.result !== null) {
      value = value.result; 
    }

    else if (value.text) {
      value = value.text; 
    }

    else if (value instanceof Date) {
      return value.toISOString().split("T")[0]; 
    }

    else {
      value = value.toString();
    }
  }

  value = value.toString().trim();


  if (value === "-" || value === "--" || value === "") {
    return null;
  }


  if (!isNaN(value)) {
    return Number(value);
  }

  return value;
};



export const getPmegData = async (req, res) => {
  const query = "SELECT * FROM pmeg_data_table";

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching PMEG data:", err);
    return res.status(500).json({ message: "Database error" });
  }
};


export const getPmegDataByYear = async (req, res) => {
  const { year } = req.params;

  if (!year) {
    return res.status(400).json({ message: "Year parameter is required" });
  }

  const query = "SELECT * FROM pmeg_data_table WHERE year = ?";

  try {
    const [results] = await db.query(query, [year]);
    res.json(results);
  } catch (err) {
    console.error("Database error fetching PMEG data by year:", err);
    return res.status(500).json({ message: "Database error" });
  }
};


export const uploadPmegData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    const dataToInsert = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        const rowData = [
          getCellVal(row.getCell(1)), getCellVal(row.getCell(2)), getCellVal(row.getCell(3)),
          getCellVal(row.getCell(4)), getCellVal(row.getCell(5)), getCellVal(row.getCell(6)),
          getCellVal(row.getCell(7)), getCellVal(row.getCell(8)), getCellVal(row.getCell(9)),
          getCellVal(row.getCell(10)), getCellVal(row.getCell(11)), getCellVal(row.getCell(12)),
          getCellVal(row.getCell(13)), getCellVal(row.getCell(14)), getCellVal(row.getCell(15)),
          getCellVal(row.getCell(16)), getCellVal(row.getCell(17)), getCellVal(row.getCell(18))
        ];
        if (rowData[1]) dataToInsert.push(rowData);
      }
    });

    if (dataToInsert.length === 0)
      return res.status(400).json({ message: "No valid data rows found." });

    const columns = [
      "rowNo", "name", "agencyReceived", "agencyReturned", "Pending_At_Agency",
      "Forwarded_to_Bank", "sanctionedPrj", "sanctionedLakh", "claimedPrj",
      "claimedLakh", "disbursementPrj", "disbursementLakh", "bankReturned",
      "pendingBankPrj", "pendingBankLakh", "pendingDisbursementPrj", "pendingDisbursementLakh", "year"
    ];

    const query = `
      INSERT INTO pmeg_data_table (${columns.join(", ")}) 
      VALUES ?
    `;

    const [result] = await db.query(query, [dataToInsert]);
    res.status(201).json({ message: `Main file processed. ${result.affectedRows} rows added. Old data preserved.` });

  } catch (error) {
    console.error("Error processing Main Excel:", error);
    res.status(500).json({ message: "Error processing file.", error: error.message });
  }
};



function normalizeHeader(header) {
  if (!header) return null;
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}


function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Get actual columns from a database table
async function getTableColumns(tableName) {
  try {
    const [results] = await db.query(`DESCRIBE ${tableName}`);
    return results.map(row => row.Field);
  } catch (err) {
    console.error(`ERROR getting columns for ${tableName}:`, err.message);
    return [];
  }
}


export const uploadAgencyDetailData = async (req, res) => {
  console.log("uploadAgencyDetailData called");
  console.log("req.file:", req.file ? "exists" : "MISSING");
  console.log("req.body:", req.body);
  console.log("req.body.tableName:", req.body?.tableName);
  console.log("Headers:", req.headers['content-type']);

  if (!req.file) {
    console.error("ERROR: No file in request");
    return res.status(400).json({ message: "No file uploaded." });
  }

  // Safer tableName extraction
  let tableName = (req.body?.tableName || '').toString().trim();
  if (!tableName) {
    tableName = 'ALL'; // default
  }
  console.log("Resolved tableName:", tableName);

  const sheetTableMap = {
    'Received': 'agency_received',
    'Returned at Agency': 'agency_returned',
    'Forwarded to Bank': 'forwarded_to_bank',
    'Sanctioned': 'sanctioned_by_bank_no_of_proj',
    'MM Claimed': 'mm_claimed_no_of_proj',
    'MM Disbursement': 'mm_disbursement_no_of_proj',
    'Returned by Bank': 'returned_by_bank',
    'Pending at Agency': 'pending_for_mm_disbursement_no_of_proj',
    'Pend MM Disbmt - Total': 'pending_for_mm_disbursement_no_of_proj',
    'Pend MM Disbmt - Detail': 'pending_for_mm_disbursement_no_of_proj'
  };

  const allowedTableNames = Object.values(sheetTableMap);

  if (!tableName) {
    // default to all sheets mode when no tableName is given.
    tableName = 'ALL';
  }

  const isAllMode = tableName.toUpperCase() === 'ALL';

  if (!isAllMode && !allowedTableNames.includes(tableName)) {
    console.log(`Invalid table name: "${tableName}", allowed: ${allowedTableNames.join(", ")}`);
    return res.status(400).json({ 
      message: `Table name "${tableName}" not in allowed list: ${allowedTableNames.join(", ")}` 
    });
  }

  try {
    console.log("Processing Agency / District Excel File...");

    let workbook;
    try {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      console.log("✓ Workbook loaded successfully");
    } catch (loadErr) {
      console.error("ERROR loading workbook:", loadErr.message);
      return res.status(400).json({ message: "Cannot parse Excel file. Ensure it's a valid .xlsx file." });
    }

    let worksheets;
    try {
      worksheets = isAllMode
        ? workbook.worksheets
        : workbook.worksheets.filter(ws => {
            return ws.name === tableName || sheetTableMap[ws.name] === tableName;
          });
      console.log(`✓ Found ${worksheets.length} matching worksheets`);
    } catch (wsErr) {
      console.error("ERROR filtering worksheets:", wsErr.message);
      return res.status(500).json({ message: "Error reading worksheet names." });
    }

    if (!worksheets || worksheets.length === 0) {
      return res.status(400).json({ message: "No matching worksheet(s) found." });
    }

    const dbColumns = [
      "current_status", "under_process_agency_reason", "office_name", "agency_type", "state",
      "applicant_id", "applicant_name", "applicant_address", "applicant_mobile_no", "alternate_mobile_no",
      "email", "aadhar_no", "legal_status", "gender", "category", "special_category",
      "qualification", "date_of_birth", "age", "unit_location", "unit_address",
      "taluk_block", "unit_district", "industry_type", "product_desc_activity",
      "proposed_project_cost", "mm_involve", "financing_branch_ifsc_code", "financing_branch_address",
      "online_submission_date", "dltfec_meeting", "dltfec_meeting_place", "forwarding_date_to_bank",
      "bank_remarks", "date_of_documents_receiveda_at_bank",
      "project_cost_approved_ce", "project_cost_approved_wc", "project_cost_approved_total",
      "sanctioned_by_bank_date", "sanctioned_by_bank_ce", "sanctioned_by_bank_wc", "sanctioned_by_bank_total",
      "date_of_deposit_own_contribution", "own_contribution_amount_deposited",
      "covered_under_cgtsi", "date_of_loan_release", "loan_release_amount",
      "mm_claim_date", "mm_claim_amount", "remarks_for_mm_process_at_pmegp_co_mumbai",
      "mm_release_date", "mm_release_amount", "payment_status", "mm_disbursement_transaction_id", "fail_reason",
      "edp_training_center_name", "training_start_date", "training_end_date", "training_duration_days",
      "certificate_issue_date", "physical_verification_conducted_date", "physical_verification_status",
      "mm_final_adjustment_date", "mm_final_adjustment_amount",
      "tdr_account_no", "tdr_date", "year"
    ];

    let totalInserted = 0;
    let totalDataRows = 0;

    for (const worksheet of worksheets) {
      try {
        console.log(`\n📄 Processing worksheet: "${worksheet.name}"`);
        
        let targetTable = tableName;
        if (isAllMode) {
          targetTable = sheetTableMap[worksheet.name];
        } else if (sheetTableMap[worksheet.name]) {
          targetTable = sheetTableMap[worksheet.name];
        }

        if (!targetTable) {
          console.log(`⚠️  Skipping worksheet "${worksheet.name}" - no table mapping`);
          continue;
        }

        console.log(`  → Mapping to table: ${targetTable}`);

        // Get actual columns from the target table
        const actualTableColumns = await getTableColumns(targetTable);
        console.log(`  → Target table has ${actualTableColumns.length} columns`);

        // Filter dbColumns to only those that exist in the target table
        const relevantColumns = dbColumns.filter(col => actualTableColumns.includes(col));
        console.log(`  → Using ${relevantColumns.length} matching columns for insert`);

        const headerMap = {};
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          const normalizedHeader = normalizeHeader(cell.value);
          relevantColumns.forEach(dbCol => {
            if (normalizedHeader === dbCol) {
              headerMap[dbCol] = colNumber;
            }
          });
        });
        console.log(`  → Header map created with ${Object.keys(headerMap).length} matched columns`);

        const dataToInsert = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber <= 1) return;

          const rowData = relevantColumns.map(col => {
            const excelIndex = headerMap[col];
            return excelIndex ? getCellVal(row.getCell(excelIndex)) : null;
          });

          const yearIndex = relevantColumns.indexOf('year');
          if (yearIndex >= 0) {
            const yearValue = rowData[yearIndex];
            const yearStr = yearValue == null ? '' : String(yearValue).trim().toLowerCase();
            if (!yearStr || yearStr === 'nan' || yearStr === 'none') {
              rowData[yearIndex] = '2022-2023';
            }
          }

          // Check if first non-null column or second column is populated (flexible row validation)
          const hasData = rowData.some((val, idx) => val && idx < 5);
          if (hasData) dataToInsert.push(rowData);
        });

        if (dataToInsert.length === 0) {
          console.log(`  ⚠️  No valid data rows found`);
          continue;
        }

        console.log(`  ✓ Extracted ${dataToInsert.length} data rows`);
        totalDataRows += dataToInsert.length;

      const query = `
      INSERT INTO ${targetTable} (${relevantColumns.join(", ")})
      VALUES ?
      ON DUPLICATE KEY UPDATE
        ${relevantColumns.slice(1).map(col => `${col} = VALUES(${col})`).join(",\n        ")}
    `;

        const chunks = chunkArray(dataToInsert, 500);
        console.log(`  → Splitting ${dataToInsert.length} rows into ${chunks.length} batch(es)`);
        
        for (let i = 0; i < chunks.length; i++) {
          const batch = chunks[i];
          try {
            console.log(`  → Batch ${i + 1}/${chunks.length}: inserting ${batch.length} rows...`);
            const [result] = await db.query(query, [batch]);
            totalInserted += result.affectedRows;
            console.log(`    ✓ Batch ${i + 1} success: ${result.affectedRows} rows affected`);
          } catch (batchErr) {
            console.error(`  ✗ ERROR in batch ${i + 1}:`, batchErr.message);
            throw batchErr; // propagate to outer catch
          }
        }
        console.log(`  ✓ All batches completed for "${worksheet.name}"`);
        
      } catch (worksheetErr) {
        console.error(`✗ ERROR processing worksheet "${worksheet.name}":`, worksheetErr.message);
        throw worksheetErr; // propagate to outer catch
      }
    }

    if (totalDataRows === 0) {
      return res.status(400).json({ message: "No valid data rows found on any processed sheet." });
    }

    return res.status(201).json({
      message: `Uploaded successfully across ${worksheets.length} worksheets. ` +
               `Total rows prepared ${totalDataRows}, inserted/updated ${totalInserted}.`,
    });

  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error);
    console.error("Stack:", error.stack);

    if (error.sqlMessage) {
      return res.status(500).json({ message: `Database error: ${error.sqlMessage}` });
    }

    return res.status(500).json({ 
      message: "Error processing file.", 
      error: error.message,
      details: error.sqlMessage || error.stack 
    });
  }
};



export const getDistrictData = async (req, res) => {

  const { district } = req.params;
  const { year, columnKey } = req.query;

  try {

    // Map dashboard column → database table
    const tableMap = {

      agencyReceived: "agency_received",

      agencyReturned: "agency_returned",

      Pending_At_Agency: "prnding_at_agency",

      Forwarded_to_Bank: "forwarded_to_bank",

      sanctionedPrj: "sanctioned_by_bank_no_of_proj",

      claimedPrj: "mm_claimed_no_of_proj",

      disbursementPrj: "mm_disbursement_no_of_proj",

      pendingBankPrj: "pending_at_bank_no_of_proj",

      pendingDisbursementPrj: "pending_for_mm_disbursement_no_of_proj",

      physicalVerification: "physical_verification_data"

    };

    // Get table name from columnKey
    const targetTable = tableMap[columnKey];

    if (!targetTable) {
      return res.status(400).json({
        message: `Invalid columnKey: ${columnKey}`
      });
    }

    // Build query
    let query = `
      SELECT *
      FROM ${targetTable}
      WHERE unit_district = ?
    `;

    const params = [district];

    if (year) {
      query += ` AND year = ?`;
      params.push(year);
    }

    query += ` ORDER BY applicant_id ASC`;

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (error) {

    console.error("District Fetch Error:", error.message);

    res.status(500).json({
      message: "Database error fetching district data",
      error: error.message
    });

  }

};

export const uploadKvibData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ error: "Worksheet not found" });
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.map(h => h?.toString().trim());

    const headerMap = {
      "Trainee Id": "trainee_id",
      "Name": "name",
      "Batch Id": "batch_id",
      "Batch Year": "batch_year",
      "DOB": "dob",
      "Gender": "gender",
      "Father / Spouse Name": "father_spouse_name",
      "Category": "category",
      "Tel. No.": "tel_no",
      "Religion": "religion",
      "Address": "address",
      "Email": "email",
      "Course Name": "course_name"
    };

    const rowsToInsert = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; 

      const rowData = {};

      headers.forEach((header, index) => {
        const dbField = headerMap[header];
        if (dbField) {
          rowData[dbField] = getCellVal(row.getCell(index));
        }
      });

      if (!rowData.trainee_id || !rowData.batch_id) {
        return; 
      }

      rowsToInsert.push(rowData);
    });

    if (rowsToInsert.length === 0) {
      return res.status(400).json({ error: "No valid rows found in Excel" });
    }

   
    const sql = `
      INSERT INTO kvib_data (
        trainee_id, name, batch_id, batch_year, dob, gender,
        father_spouse_name, category, tel_no, religion,
        address, email, course_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        batch_year = VALUES(batch_year),
        dob = VALUES(dob),
        gender = VALUES(gender),
        father_spouse_name = VALUES(father_spouse_name),
        category = VALUES(category),
        tel_no = VALUES(tel_no),
        religion = VALUES(religion),
        address = VALUES(address),
        email = VALUES(email),
        course_name = VALUES(course_name)
    `;

    for (const r of rowsToInsert) {
      await db.query(sql, [
        r.trainee_id,
        r.name,
        r.batch_id,
        r.batch_year,
        r.dob,
        r.gender,
        r.father_spouse_name,
        r.category,
        r.tel_no,
        r.religion,
        r.address,
        r.email,
        r.course_name
      ]);
    }

    res.json({
      message: `KVIB Excel uploaded successfully. ${rowsToInsert.length} rows processed.`,
    });

  } catch (err) {
    console.error("KVIB Excel upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getDateRange = async (req, res) => {
  try {
    const query = `
      SELECT 
        MIN(online_submission_date) as minDate,
        MAX(online_submission_date) as maxDate
      FROM total_district_data
    `;

    const [results] = await db.query(query);
    
    if (results && results.length > 0) {
      res.json({
        fromDate: results[0].minDate,
        toDate: results[0].maxDate
      });
    } else {
      res.json({ fromDate: null, toDate: null });
    }
  } catch (err) {
    console.error("Database error fetching date range:", err);
    return res.status(500).json({ message: "Database error" });
  }
};
