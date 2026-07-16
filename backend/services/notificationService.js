const Task = require('../models/Task');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a, b) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(a) - startOfDay(b)) / MS_PER_DAY);
}

async function getUsersById() {
  const users = await User.find().sort({ createdAt: -1 });
  const map = {};
  users.forEach(u => { map[String(u._id)] = u; });
  return map;
}

function getAssignedUser(task, usersById) {
  if (!task.assignedTo) return null;
  if (typeof task.assignedTo === 'object' && task.assignedTo.name) return task.assignedTo;
  return usersById[String(task.assignedTo)] || null;
}

function buildMessage(task, user, kind) {
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A';

  if (kind === 'reminder') {
    return {
      subject: `Reminder: "${task.title}" is due tomorrow`,
      text: `Hi ${user.name},\n\nThis is a reminder that your task "${task.title}" (${task.phase}) is due tomorrow, ${dueDateStr}.\nCurrent status: ${task.status}.\n\nPlease make sure to complete it on time.\n\n- Mai Mara Prasangaya Campaign Team`
    };
  }

  return {
    subject: `Overdue: "${task.title}" needs your attention`,
    text: `Hi ${user.name},\n\nYour task "${task.title}" (${task.phase}) was due on ${dueDateStr} and is now overdue.\nCurrent status: ${task.status}.\n\nPlease update it as soon as possible.\n\n- Mai Mara Prasangaya Campaign Team`
  };
}

async function notifyUserForTask(task, user, kind) {
  const { subject, text } = buildMessage(task, user, kind);
  const emailResult = await sendEmail({ to: user.email, subject, text });
  return { emailResult };
}

// Runs the daily check: sends "due tomorrow" reminders and "overdue" alerts via email.
async function runDailyCheck() {
  const tasks = await Task.find().sort({ createdAt: -1 });
  const usersById = await getUsersById();

  const today = startOfDay(new Date());
  let remindersSent = 0;
  let overdueSent = 0;
  const errors = [];

  for (const task of tasks) {
    if (!task.dueDate || task.status === 'Completed' || !task.assignedTo) continue;

    const user = getAssignedUser(task, usersById);
    if (!user) continue;

    const diff = daysBetween(task.dueDate, today); // 1 = due tomorrow, negative = overdue

    try {
      if (diff === 1 && !task.reminderSent) {
        await notifyUserForTask(task, user, 'reminder');
        await Task.findByIdAndUpdate(task._id, { reminderSent: true });
        remindersSent++;
      } else if (diff < 0) {
        const lastNotified = task.lastOverdueNotifiedDate ? startOfDay(task.lastOverdueNotifiedDate) : null;
        const alreadyNotifiedToday = lastNotified && lastNotified.getTime() === today.getTime();

        if (!alreadyNotifiedToday) {
          await notifyUserForTask(task, user, 'overdue');
          await Task.findByIdAndUpdate(task._id, { lastOverdueNotifiedDate: new Date() });
          overdueSent++;
        }
      }
    } catch (error) {
      errors.push({ taskId: task._id, error: error.message });
    }
  }

  return { remindersSent, overdueSent, totalChecked: tasks.length, errors };
}

// Manually notify the assigned member of a single task right now, bypassing the once-a-day dedupe.
async function notifyTaskNow(taskId) {
  const tasks = await Task.find().sort({ createdAt: -1 });
  const task = tasks.find(t => String(t._id) === String(taskId));
  if (!task) throw new Error('Task not found');
  if (!task.assignedTo) throw new Error('Task has no assigned member');

  const usersById = await getUsersById();
  const user = getAssignedUser(task, usersById);
  if (!user) throw new Error('Assigned member not found');

  const today = startOfDay(new Date());
  const diff = task.dueDate ? daysBetween(task.dueDate, today) : null;
  const kind = (diff !== null && diff < 0) ? 'overdue' : 'reminder';

  const result = await notifyUserForTask(task, user, kind);
  return { user: user.name, kind, ...result };
}

module.exports = { runDailyCheck, notifyTaskNow };