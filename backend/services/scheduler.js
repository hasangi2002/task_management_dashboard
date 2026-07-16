const cron = require('node-cron');
const { runDailyCheck } = require('./notificationService');

function startScheduler() {
  // Runs every day at 8:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily task notification check...');
    try {
      const result = await runDailyCheck();
      console.log(`✅ Notification check complete. Reminders sent: ${result.remindersSent}, Overdue alerts sent: ${result.overdueSent}`);
      if (result.errors.length > 0) {
        console.warn('Some notifications failed:', result.errors);
      }
    } catch (error) {
      console.error('❌ Notification check failed:', error.message);
    }
  });

  console.log('📅 Notification scheduler started (daily at 8:00 AM).');
}

module.exports = { startScheduler };