import db from '../config/db.js';

 
export const getAllCbcData = async (req, res) => {
  try {
    const { district } = req.query;
    let query = 'SELECT * FROM cbc_data';
    const params = [];

    if (district) {
      query += ' WHERE district = ?';
      params.push(district);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching CBC data:', error);
    res.status(500).json({ error: error.message });
  }
};
 
export const getCbcDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM cbc_data WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'CBC data not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching CBC data by ID:', error);
    res.status(500).json({ error: error.message });
  }
};