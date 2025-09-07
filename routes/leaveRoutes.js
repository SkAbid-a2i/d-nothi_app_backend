const express = require('express');
const { getLeaves, createLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getLeaves);
router.post('/', authorize(['Agent']), createLeave);
router.put('/:id/status', authorize(['SystemAdmin', 'Admin', 'Supervisor']), updateLeaveStatus);

module.exports = router;