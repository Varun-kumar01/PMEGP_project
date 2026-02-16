import db from '../config/db.js';

export const getYears = async (req, res) => {


  try {
    const sql = `
      SELECT DISTINCT batch_year
      FROM kvib_data
      ORDER BY batch_year
    `;

    const [rows] = await db.query(sql);

    res.json(rows.map(r => r.batch_year));
  } catch (error) {
    console.error('getYears error:', error);
    res.status(500).json({ message: 'Failed to fetch years' });
  }
};


export const getYearWiseStats = async (req, res) => {
  const { year } = req.params;

  try {
    const sql = `
      SELECT
        batch_year AS year,
        COUNT(DISTINCT batch_id) AS no_of_batches,
        COUNT(*) AS no_of_trainees
      FROM kvib_data
      WHERE batch_year = ?
      GROUP BY batch_year
    `;

    const [rows] = await db.query(sql, [year]);

    res.json(rows[0] || {
      year,
      no_of_batches: 0,
      no_of_trainees: 0
    });
  } catch (error) {
    console.error('getYearWiseStats error:', error);
    res.status(500).json({ message: 'Failed to fetch year stats' });
  }
};


export const getTotalStats = async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(DISTINCT batch_id) AS total_batches,
        COUNT(*) AS total_trainees
      FROM kvib_data
    `;

    const [rows] = await db.query(sql);

    res.json(rows[0]);
  } catch (error) {
    console.error('getTotalStats error:', error);
    res.status(500).json({ message: 'Failed to fetch total stats' });
  }
};

export const getYearDetails = async (req, res) => {
  const { year } = req.params;

  const sql = `
    SELECT
      trainee_id,
      name,
      batch_id,
      course_name,
      gender,
      father_spouse_name,
      category,
      address
    FROM kvib_data
    WHERE batch_year = ?
    ORDER BY id ASC
  `;

  const [rows] = await db.query(sql, [year]);
  res.json(rows);
};

