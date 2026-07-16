const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, requireProjectAccess } = require('../middleware/auth');
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateMonth
} = require('../controllers/templateController');

router.use(protect, requireProjectAccess);

router.get('/', getTemplates);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/generate', generateMonth);

module.exports = router;