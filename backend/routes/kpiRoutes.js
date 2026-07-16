const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, requireProjectAccess } = require('../middleware/auth');
const { getKPIs, createKPI, upsertKPI } = require('../controllers/kpiController');

router.use(protect, requireProjectAccess);

router.get('/', getKPIs);
router.post('/', createKPI);
router.put('/upsert', upsertKPI);

module.exports = router;