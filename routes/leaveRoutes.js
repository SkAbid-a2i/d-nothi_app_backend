const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createLeave, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');

router.post('/', protect, createLeave);
router.get('/', protect, getLeaves);
router.put('/:id/status', protect, roleMiddleware(['SystemAdmin', 'Admin', 'Supervisor']), updateLeaveStatus);

module.exports = router;