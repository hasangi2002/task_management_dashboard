const { generateTaskDetails } = require('../services/aiService');
const Project = require('../models/Project');

const generateDetails = async (req, res) => {
  try {
    const { roughIdea } = req.body;
    if (!roughIdea || !roughIdea.trim()) {
      return res.status(400).json({ message: 'Please describe the task idea first' });
    }

    const project = await Project.findById(req.params.projectId);
    const projectName = project ? project.name : 'Campaign';

    const result = await generateTaskDetails({ roughIdea: roughIdea.trim(), projectName });
    res.json(result);
  } catch (error) {
    console.error('AI generation failed:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate task details' });
  }
};

module.exports = { generateDetails };