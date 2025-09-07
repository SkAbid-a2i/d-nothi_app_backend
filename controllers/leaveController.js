const pool = require('../config/db');
const { body, validationResult } = require('express-validator');

const createLeave = [
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('reason').notEmpty().trim().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { start_date, end_date, reason } = req.body;
    const user_id = req.user.id;

    try {
      const [result] = await pool.query(
        'INSERT INTO leaves (user_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, start_date, end_date, reason, 'Pending']
      );

      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, after_value, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, 'CREATE', 'Leave', result.insertId, JSON.stringify({ start_date, end_date, reason }), req.ip, req.get('User-Agent')]
      );

      res.status(201).json({ message: 'Leave request created', leaveId: result.insertId });
    } catch (error) {
      next(error);
    }
  }
];

const getLeaves = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM leaves';
    const params = [];

    if (req.user.role === 'Agent') {
      query += ' WHERE user_id = ?';
      params.push(req.user.id);
    }

    const [leaves] = await pool.query(query, params);
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = [
  body('status').isIn(['Approved', 'Rejected']),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
      const [existing] = await pool.query('SELECT * FROM leaves WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Leave not found' });
      }

      await pool.query('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?', [status, req.user.id, id]);

      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_value, after_value, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, 'UPDATE', 'Leave', id, JSON.stringify(existing[0]), JSON.stringify({ status }), req.ip, req.get('User-Agent')]
      );

      res.json({ message: 'Leave status updated' });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = { createLeave, getLeaves, updateLeaveStatus };