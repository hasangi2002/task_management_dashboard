const express = require('express');
const router = express.Router();
const { protect, requireProjectAccess } = require('../middleware/auth');
const {
  getMyProjects,
  createProject,
  getProject,
  updateProject,
  addAdminToProject
} = require('../controllers/projectController');

router.get('/', protect, getMyProjects);
router.post('/', protect, createProject);
router.get('/:projectId', protect, requireProjectAccess, getProject);
router.put('/:projectId', protect, requireProjectAccess, updateProject);
router.post('/:projectId/add-admin', protect, requireProjectAccess, addAdminToProject);

module.exports = router;