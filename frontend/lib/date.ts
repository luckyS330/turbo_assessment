/**
 * Format rules:
 * - Same calendar day as today → "Today"
 * - Yesterday → "Yesterday"
 * - Older → "Jan 5", "Mar 17", etc. (no year)
 */
export function formatNoteDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const toDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round((toDay(now) - toDay(date)) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
