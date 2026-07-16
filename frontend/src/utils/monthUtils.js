export function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

// Builds a sorted (newest first) list of month strings ("YYYY-MM") found in the
// given tasks, always including the current month even if it has no tasks yet.
export function getAvailableMonths(tasks) {
  const months = Array.from(new Set(tasks.map(t => t.month).filter(Boolean)));
  if (!months.includes(currentMonthStr())) months.push(currentMonthStr());
  return months.sort((a, b) => b.localeCompare(a));
}

// Filters a task list by the selected month. 'All' returns everything unchanged.
export function filterTasksByMonth(tasks, selectedMonth) {
  if (selectedMonth === 'All') return tasks;
  return tasks.filter(t => t.month === selectedMonth);
}