const { runDailyCheck, notifyTaskNow } = require('../services/notificationService');

const runNotificationCheck = async (req, res) => {
  try {
    const result = await runDailyCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const notifyTask = async (req, res) => {
  try {
    const result = await notifyTaskNow(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { runNotificationCheck, notifyTask };