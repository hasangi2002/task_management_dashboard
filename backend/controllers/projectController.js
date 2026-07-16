const Project = require('../models/Project');
const Admin = require('../models/Admin');

const getMyProjects = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const projects = await Project.find({ admins: req.user.id }).sort({ createdAt: -1 });
      return res.json(projects);
    } else {
      if (!req.user.projectId) return res.json([]);
      const project = await Project.findById(req.user.projectId);
      return res.json(project ? [project] : []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create projects' });
    }
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description: description || '',
      admins: [req.user.id]
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { ...(name && { name }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lets an existing project admin share management with another admin account, by email.
const addAdminToProject = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'No admin account found with that email' });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.admins.some(a => a.toString() === admin._id.toString())) {
      return res.status(400).json({ message: 'That admin already manages this project' });
    }

    project.admins.push(admin._id);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProjects, createProject, getProject, updateProject, addAdminToProject };