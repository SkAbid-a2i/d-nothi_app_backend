const express = require('express');
const { getUsers, createUser, validateUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);
router.get('/', authorize(['SystemAdmin', 'Admin']), getUsers);
router.post('/', authorize(['SystemAdmin']), validateUser, createUser);

module.exports = router;