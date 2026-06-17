const KPI = require('../models/KPI');

const getKPIs = async (req, res) => {
  try {
    const kpis = await KPI.find().sort({ createdAt: -1 });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createKPI = async (req, res) => {
  try {
    const kpi = await KPI.create(req.body);
    res.status(201).json(kpi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getKPIs, createKPI };
