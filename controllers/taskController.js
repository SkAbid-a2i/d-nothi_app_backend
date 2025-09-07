const pool = require('../config/db');
const { body, query, validationResult } = require('express-validator');

const createTask = [
  body('title').notEmpty().trim().escape(),
  body('status').isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']),
  body('priority').isIn(['Low', 'Medium', 'High']),
  body('due_date').optional().isISO8601(),
  body('assigned_user_id').optional().isInt(),
  body('category_id').optional().isInt(),
  body('service_id').optional().isInt(),
  body('office_id').optional().isInt(),
  body('source_id').optional().isInt(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id } = req.body;
    const created_by = req.user.id;

    try {
      const [result] = await pool.query(
        'INSERT INTO tasks (title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id, created_by]
      );

      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, after_value, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, 'CREATE', 'Task', result.insertId, JSON.stringify({ title }), req.ip, req.get('User-Agent')]
      );

      res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (error) {
      next(error);
    }
  }
];

const getTasks = [
  query('status').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']),
  query('priority').optional().isIn(['Low', 'Medium', 'High']),
  query('assigned_user_id').optional().isInt(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, priority, assigned_user_id } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (assigned_user_id && req.user.role !== 'Agent') {
      query += ' AND assigned_user_id = ?';
      params.push(assigned_user_id);
    } else if (req.user.role === 'Agent') {
      query += ' AND assigned_user_id = ?';
      params.push(req.user.id);
    }

    try {
      const [tasks] = await pool.query(query, params);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
];

const updateTask = [
  body('title').optional().notEmpty().trim().escape(),
  body('status').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('due_date').optional().isISO8601(),
  body('assigned_user_id').optional().isInt(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id } = req.body;

    try {
      const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await pool.query(
        'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, assigned_user_id = ?, category_id = ?, service_id = ?, office_id = ?, source_id = ? WHERE id = ?',
        [title || existing[0].title, description || existing[0].description, status || existing[0].status, priority || existing[0].priority, due_date || existing[0].due_date, assigned_user_id || existing[0].assigned_user_id, category_id || existing[0].category_id, service_id || existing[0].service_id, office_id || existing[0].office_id, source_id || existing[0].source_id, id]
      );

      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_value, after_value, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, 'UPDATE', 'Task', id, JSON.stringify(existing[0]), JSON.stringify(req.body), req.ip, req.get('User-Agent')]
      );

      res.json({ message: 'Task updated' });
    } catch (error) {
      next(error);
    }
  }
];

const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, before_value, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE', 'Task', id, JSON.stringify(existing[0]), req.ip, req.get('User-Agent')]
    );

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };