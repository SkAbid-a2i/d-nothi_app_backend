const express = require('express');
const { getTasks, createTask, deleteTask } = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', authorize(['SystemAdmin', 'Admin', 'Supervisor']), createTask);
router.delete('/:id', authorize(['SystemAdmin', 'Admin', 'Supervisor']), deleteTask);

module.exports = router;