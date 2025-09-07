const { body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const pool = require('../config/db');

exports.validateUser = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['SystemAdmin', 'Admin', 'Supervisor', 'Agent']).withMessage('Invalid role')
];

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, role FROM users');
    res.json(users);
  } catch (error) {
    next(error);
  }
};