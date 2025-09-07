const pool = require('../config/db');

exports.getLeaves = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let query = 'SELECT * FROM leaves';
    const params = [];
    if (role === 'Agent') {
      query += ' WHERE user_id = ?';
      params.push(id);
    }
    const [leaves] = await pool.query(query, params);
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

exports.createLeave = async (req, res, next) => {
  try {
    const { start_date, end_date, reason } = req.body;
    await pool.query(
      'INSERT INTO leaves (user_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, start_date, end_date, reason, 'Pending']
    );
    res.status(201).json({ message: 'Leave requested' });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE leaves SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Leave status updated' });
  } catch (error) {
    next(error);
  }
};