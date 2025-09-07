const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getUsers, updateUserRole, toggleUserActive } = require('../controllers/userController');

router.get('/', protect, roleMiddleware(['SystemAdmin', 'Admin']), getUsers);
router.put('/:id/role', protect, roleMiddleware(['SystemAdmin']), updateUserRole);
router.put('/:id/active', protect, roleMiddleware(['SystemAdmin', 'Admin']), toggleUserActive);

module.exports = router;