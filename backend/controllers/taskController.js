const Task = require("../models/Task");

function monthStrFromDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonthStr() {
  return monthStrFromDate(new Date());
}

const getTasks = async (req, res) => {
  try {
    const allTasks = await Task.find().sort({ createdAt: -1 });
    const tasks = allTasks.filter(t => String(t.project) === req.params.projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }
    const body = { ...req.body, project: req.params.projectId };
    if (!body.month) {
      body.month = body.dueDate ? monthStrFromDate(body.dueDate) : currentMonthStr();
    }
    const task = await Task.create(body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const allTasks = await Task.find().sort({ createdAt: -1 });
    const existing = allTasks.find(t => String(t._id) === req.params.id);
    if (!existing || String(existing.project) !== req.params.projectId) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Members can only update tasks assigned to themselves, and can't reassign or delete.
    if (req.user.role === 'member') {
      const assignedId = existing.assignedTo && (typeof existing.assignedTo === 'object' ? existing.assignedTo._id : existing.assignedTo);
      if (String(assignedId) !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      const allowedFields = ['status'];
      const attemptedFields = Object.keys(req.body);
      const disallowed = attemptedFields.filter(f => !allowedFields.includes(f));
      if (disallowed.length > 0) {
        return res.status(403).json({ message: `Members can only update status. Not allowed: ${disallowed.join(', ')}` });
      }
    }

    const body = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(body, 'dueDate')) {
      body.reminderSent = false;
      if (body.dueDate) {
        body.month = monthStrFromDate(body.dueDate);
      } else if (!body.month) {
        body.month = currentMonthStr();
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }
    const allTasks = await Task.find().sort({ createdAt: -1 });
    const existing = allTasks.find(t => String(t._id) === req.params.id);
    if (!existing || String(existing.project) !== req.params.projectId) {
      return res.status(404).json({ message: "Task not found" });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};