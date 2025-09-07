const pool = require('../config/db');
const { body, validationResult } = require('express-validator');

const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, role, is_active FROM users');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = [
  body('role').isIn(['SystemAdmin', 'Admin', 'Supervisor', 'Agent']),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    try {
      await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
      res.json({ message: 'User role updated' });
    } catch (error) {
      next(error);
    }
  }
];

const toggleUserActive = async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ message: 'User status updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUserRole, toggleUserActive };