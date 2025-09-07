const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

router.post('/', protect, roleMiddleware(['SystemAdmin', 'Admin', 'Supervisor']), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, roleMiddleware(['SystemAdmin', 'Admin', 'Supervisor']), updateTask);
router.delete('/:id', protect, roleMiddleware(['SystemAdmin', 'Admin', 'Supervisor']), deleteTask);

module.exports = router;