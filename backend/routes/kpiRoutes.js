const express = require('express');
const router = express.Router();
const { getKPIs, createKPI } = require('../controllers/kpiController');

router.get('/', getKPIs);
router.post('/', createKPI);

module.exports = router;
