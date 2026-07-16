const express = require('express');
const router = express.Router();
const { registerAdmin, login } = require('../controllers/authController');

router.post('/admin/register', registerAdmin);
router.post('/login', login);

module.exports = router;