const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const { runNotificationCheck, notifyTask } = require('../controllers/notificationController');

router.post('/run', protect, requireAdmin, runNotificationCheck);
router.post('/task/:id', protect, requireAdmin, notifyTask);

module.exports = router;