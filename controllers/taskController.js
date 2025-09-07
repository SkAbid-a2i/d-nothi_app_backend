const pool = require('../config/db');

exports.getTasks = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let query = 'SELECT * FROM tasks';
    const params = [];
    if (role === 'Agent') {
      query += ' WHERE assigned_user_id = ?';
      params.push(id);
    }
    const [tasks] = await pool.query(query, params);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date, assigned_user_id } = req.body;
    await pool.query(
      'INSERT INTO tasks (title, description, status, priority, due_date, assigned_user_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, status, priority, due_date, assigned_user_id, req.user.id]
    );
    res.status(201).json({ message: 'Task created' });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};