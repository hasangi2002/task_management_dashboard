const STORAGE_PREFIX = 'notif_read_';

function getReadSet(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadSet(userId, set) {
  localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify([...set]));
}

function getAssignedId(task) {
  if (!task.assignedTo) return null;
  return typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
}

// Builds the current list of notifications for this member: new assignments + overdue tasks.
// Each notification has a unique "key" so read-state survives across visits, and
// automatically resets if the underlying fact changes (reassigned, due date changed).
export function computeMemberNotifications(tasks, userId) {
  const today = new Date().toISOString().split('T')[0];
  const readSet = getReadSet(userId);
  const notifications = [];

  tasks.forEach(task => {
    const assignedId = getAssignedId(task);
    if (assignedId !== userId) return;

    // New assignment
    const assignKey = `assigned-${task._id}-${assignedId}`;
    notifications.push({
      key: assignKey,
      type: 'assigned',
      task,
      read: readSet.has(assignKey),
      label: `You were assigned: "${task.title}"`
    });

    // Overdue
    if (task.status !== 'Completed' && task.dueDate) {
      const dueDateStr = task.dueDate.split('T')[0];
      if (dueDateStr < today) {
        const overdueKey = `overdue-${task._id}-${dueDateStr}`;
        notifications.push({
          key: overdueKey,
          type: 'overdue',
          task,
          read: readSet.has(overdueKey),
          label: `Overdue: "${task.title}" was due ${new Date(task.dueDate).toLocaleDateString()}`
        });
      }
    }
  });

  return notifications.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
}

// For admins: any overdue task in the project, regardless of who it's assigned to.
export function computeAdminOverdueNotifications(tasks, members, adminId) {
  const today = new Date().toISOString().split('T')[0];
  const readSet = getReadSet(adminId);
  const notifications = [];

  tasks.forEach(task => {
    if (task.status === 'Completed' || !task.dueDate) return;
    const dueDateStr = task.dueDate.split('T')[0];
    if (dueDateStr >= today) return;

    const assignedId = getAssignedId(task);
    const member = assignedId ? members.find(m => m._id === assignedId) : null;
    const key = `overdue-${task._id}-${dueDateStr}`;

    notifications.push({
      key,
      type: 'overdue',
      task,
      read: readSet.has(key),
      label: `Overdue: "${task.title}"${member ? ` — ${member.name}` : ' (Unassigned)'}`
    });
  });

  return notifications.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
}

export function markAllRead(userId, notifications) {
  const readSet = getReadSet(userId);
  notifications.forEach(n => readSet.add(n.key));
  saveReadSet(userId, readSet);
}