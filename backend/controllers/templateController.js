const TaskTemplate = require('../models/TaskTemplate');
const Task = require('../models/Task');
const User = require('../models/User');

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function resolveDueDate(monthStr, dayOfMonth) {
  if (!dayOfMonth) return null;
  const [year, month] = monthStr.split('-').map(Number);
  const lastDayOfThisMonth = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(dayOfMonth, lastDayOfThisMonth);
  return new Date(year, month - 1, clampedDay);
}

const getTemplates = async (req, res) => {
  try {
    const all = await TaskTemplate.find().sort({ createdAt: -1 });
    const templates = all.filter(t => String(t.project) === req.params.projectId);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create templates' });
    }
    const template = await TaskTemplate.create({ ...req.body, project: req.params.projectId });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can edit templates' });
    }
    const template = await TaskTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete templates' });
    }
    const template = await TaskTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateMonth = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can generate monthly tasks' });
    }
    const projectId = req.params.projectId;
    const month = req.body.month || currentMonthStr();

    const allTemplates = await TaskTemplate.find().sort({ createdAt: -1 });
    const templates = allTemplates.filter(t => String(t.project) === projectId);

    const allTasks = await Task.find().sort({ createdAt: -1 });
    const existingTasks = allTasks.filter(t => String(t.project) === projectId);

    const allUsers = await User.find().sort({ createdAt: -1 });
    const users = allUsers.filter(u => String(u.project) === projectId);

    let created = 0;
    let skipped = 0;

    for (const tpl of templates) {
      const alreadyExists = existingTasks.some(t => t.title === tpl.title && t.month === month);
      if (alreadyExists) { skipped++; continue; }

      const matchedUser = tpl.role ? users.find(u => u.role === tpl.role) : null;
      const dueDate = resolveDueDate(month, tpl.dayOfMonth);

      await Task.create({
        title: tpl.title,
        details: tpl.details || '',
        phase: tpl.phase || 'Pre Release Campaign',
        priority: tpl.priority || 'Medium',
        status: 'Pending',
        dueDate,
        assignedTo: matchedUser ? matchedUser._id : null,
        month,
        project: projectId
      });
      created++;
    }

    res.json({ month, created, skipped, totalTemplates: templates.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTemplates, createTemplate, updateTemplate, deleteTemplate, generateMonth };