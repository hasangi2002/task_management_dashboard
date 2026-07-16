const KPI = require('../models/KPI');

const getKPIs = async (req, res) => {
  try {
    const all = await KPI.find().sort({ createdAt: -1 });
    const kpis = all.filter(k => String(k.project) === req.params.projectId);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createKPI = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create KPIs' });
    }
    const kpi = await KPI.create({ ...req.body, project: req.params.projectId });
    res.status(201).json(kpi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Creates the KPI if it doesn't exist for this project+name yet, otherwise updates it.
// Used by Settings to save "Views Target" and "Engagement Rate" without needing to
// know an existing KPI's _id.
const upsertKPI = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update KPIs' });
    }
    const { name, target, currentValue, status } = req.body;
    if (!name) return res.status(400).json({ message: 'KPI name is required' });

    const all = await KPI.find().sort({ createdAt: -1 });
    const existing = all.find(k => String(k.project) === req.params.projectId && k.name === name);

    if (existing) {
      const updated = await KPI.findByIdAndUpdate(
        existing._id,
        { ...(target !== undefined && { target }), ...(currentValue !== undefined && { currentValue }), ...(status && { status }) },
        { new: true }
      );
      return res.json(updated);
    }

    const created = await KPI.create({
      name,
      target: target ?? 0,
      currentValue: currentValue ?? 0,
      status: status || 'On Track',
      project: req.params.projectId
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getKPIs, createKPI, upsertKPI };