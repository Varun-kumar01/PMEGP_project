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


export const uploadAgencyDetailData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const tableName = req.body?.tableName;
  if (!tableName) {
    return res.status(400).json({ message: "Table name not selected." });
  }

  try {
    console.log("Processing Agency / District Excel File...");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const dataToInsert = [];

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

    const headerMap = {};

    worksheet.getRow(2).eachCell((cell, colNumber) => {
      const normalizedHeader = normalizeHeader(cell.value);

      dbColumns.forEach(dbCol => {
        if (normalizedHeader === dbCol) {
          headerMap[dbCol] = colNumber;
        }
      });
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 2) return;

      const rowData = dbColumns.map(col => {
        const excelIndex = headerMap[col];
        return excelIndex ? getCellVal(row.getCell(excelIndex)) : null;
      });

      if (rowData[0] || rowData[1]) dataToInsert.push(rowData);
    });

    if (dataToInsert.length === 0)
      return res.status(400).json({ message: "No valid data rows found." });

    const query = `
      INSERT INTO ${tableName} (${dbColumns.join(", ")})
      VALUES ?
      ON DUPLICATE KEY UPDATE
        current_status = VALUES(current_status),
        under_process_agency_reason = VALUES(under_process_agency_reason),
        office_name = VALUES(office_name),
        agency_type = VALUES(agency_type),
        state = VALUES(state),
        applicant_name = VALUES(applicant_name),
        applicant_address = VALUES(applicant_address),
        applicant_mobile_no = VALUES(applicant_mobile_no),
        alternate_mobile_no = VALUES(alternate_mobile_no),
        email = VALUES(email),
        aadhar_no = VALUES(aadhar_no),
        legal_status = VALUES(legal_status),
        gender = VALUES(gender),
        category = VALUES(category),
        special_category = VALUES(special_category),
        qualification = VALUES(qualification),
        date_of_birth = VALUES(date_of_birth),
        age = VALUES(age),
        unit_location = VALUES(unit_location),
        unit_address = VALUES(unit_address),
        taluk_block = VALUES(taluk_block),
        unit_district = VALUES(unit_district),
        industry_type = VALUES(industry_type),
        product_desc_activity = VALUES(product_desc_activity),
        proposed_project_cost = VALUES(proposed_project_cost),
        mm_involve = VALUES(mm_involve),
        financing_branch_ifsc_code = VALUES(financing_branch_ifsc_code),
        financing_branch_address = VALUES(financing_branch_address),
        online_submission_date = VALUES(online_submission_date),
        dltfec_meeting = VALUES(dltfec_meeting),
        dltfec_meeting_place = VALUES(dltfec_meeting_place),
        forwarding_date_to_bank = VALUES(forwarding_date_to_bank),
        bank_remarks = VALUES(bank_remarks),
        date_of_documents_receiveda_at_bank = VALUES(date_of_documents_receiveda_at_bank),
        project_cost_approved_ce = VALUES(project_cost_approved_ce),
        project_cost_approved_wc = VALUES(project_cost_approved_wc),
        project_cost_approved_total = VALUES(project_cost_approved_total),
        sanctioned_by_bank_date = VALUES(sanctioned_by_bank_date),
        sanctioned_by_bank_ce = VALUES(sanctioned_by_bank_ce),
        sanctioned_by_bank_wc = VALUES(sanctioned_by_bank_wc),
        sanctioned_by_bank_total = VALUES(sanctioned_by_bank_total),
        date_of_deposit_own_contribution = VALUES(date_of_deposit_own_contribution),
        own_contribution_amount_deposited = VALUES(own_contribution_amount_deposited),
        covered_under_cgtsi = VALUES(covered_under_cgtsi),
        date_of_loan_release = VALUES(date_of_loan_release),
        loan_release_amount = VALUES(loan_release_amount),
        mm_claim_date = VALUES(mm_claim_date),
        mm_claim_amount = VALUES(mm_claim_amount),
        remarks_for_mm_process_at_pmegp_co_mumbai = VALUES(remarks_for_mm_process_at_pmegp_co_mumbai),
        mm_release_date = VALUES(mm_release_date),
        mm_release_amount = VALUES(mm_release_amount),
        payment_status = VALUES(payment_status),
        mm_disbursement_transaction_id = VALUES(mm_disbursement_transaction_id),
        fail_reason = VALUES(fail_reason),
        edp_training_center_name = VALUES(edp_training_center_name),
        training_start_date = VALUES(training_start_date),
        training_end_date = VALUES(training_end_date),
        training_duration_days = VALUES(training_duration_days),
        certificate_issue_date = VALUES(certificate_issue_date),
        physical_verification_conducted_date = VALUES(physical_verification_conducted_date),
        physical_verification_status = VALUES(physical_verification_status),
        mm_final_adjustment_date = VALUES(mm_final_adjustment_date),
        mm_final_adjustment_amount = VALUES(mm_final_adjustment_amount),
        tdr_account_no = VALUES(tdr_account_no),
        tdr_date = VALUES(tdr_date),
        year = VALUES(year)
    `;

    const chunks = chunkArray(dataToInsert, 500);
    let totalInserted = 0;

    for (const batch of chunks) {
      const [result] = await db.query(query, [batch]);
      totalInserted += result.affectedRows;
    }

    return res.status(201).json({
      message: `Uploaded successfully. Total ${totalInserted} rows processed.`,
    });

  } catch (error) {
    console.error("Upload error:", error);

    if (error.sqlMessage) {
      return res.status(500).json({ message: `Database error: ${error.sqlMessage}` });
    }

    return res.status(500).json({ message: "Error processing file.", error: error.message });
  }
};



export const getDistrictData = async (req, res) => {
  const { district } = req.params;
  const { year, columnKey } = req.query; 

  try {
    // 1. Map the columnKey to the CORRECT specific table
    let targetTable = "total_district_data"; // Default table

    if (columnKey) {
      switch (columnKey) {
        case "agencyReceived":
          targetTable = "your_actual_received_table_name"; // CHANGE THIS to your real table name
          break;
        case "agencyReturned":
          targetTable = "your_actual_returned_table_name"; // CHANGE THIS
          break;
        case "Forwarded_to_Bank":
          targetTable = "your_actual_forwarded_table_name"; // CHANGE THIS
          break;
        case "sanctionedPrj":
          targetTable = "your_actual_sanctioned_table_name"; // CHANGE THIS
          break;
        // Add a case for every one of your 15 columns here
        default:
          // If columnKey is provided but doesn't match, return an error
          return res.status(400).json({ message: `No table mapped for column: ${columnKey}` });
      }
    }

    // 2. Build the query with the mapped table name
    // We use string interpolation for the table name because SQL parameters (?) 
    // only work for VALUES, not TABLE names.
    let query = `SELECT * FROM ${targetTable} WHERE unit_district = ?`;
    const params = [district];

    if (year) {
      query += ` AND year = ?`;
      params.push(year);
    }

    query += ` ORDER BY applicant_id ASC`;

    const [rows] = await db.query(query, params);
    return res.json(rows);

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
