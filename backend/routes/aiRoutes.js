const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, requireProjectAccess } = require('../middleware/auth');
const { generateDetails } = require('../controllers/aiController');

router.use(protect, requireProjectAccess);

router.post('/generate-task-details', generateDetails);

module.exports = router;