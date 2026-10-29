/**
 * Date and timezone utilities for MediCircle
 */

/**
 * Returns current wall-clock date wrapped in a Date object whose UTC components
 * match the local time in the application's timezone (default: Asia/Kolkata, UTC+5:30).
 * This ensures that on cloud hosts running in UTC (like Render),
 * comparisons against scheduled times like "08:00" match the user's local day and time.
 */
export function getWallClockTime(): Date {
  const now = new Date();
  // If system timezone offset is 0 (as on Linux/Render cloud UTC), use default offset (-330 minutes for IST)
  const offsetMinutes = now.getTimezoneOffset() !== 0 
    ? now.getTimezoneOffset() 
    : (process.env.DEFAULT_TZ_OFFSET ? parseInt(process.env.DEFAULT_TZ_OFFSET, 10) : -330);
    
  return new Date(now.getTime() - offsetMinutes * 60000);
}

/**
 * Formats a medicine log's scheduled_date and scheduled_time into clean, readable strings.
 * e.g., Date: "Oct 28, 2026", Time: "8:00 PM", DateTime: "Oct 28, 2026 at 8:00 PM"
 */
export function formatDoseDateTime(scheduledDate: Date, scheduledTime: Date): {
  formattedDate: string;
  formattedTime: string;
  formattedDateTime: string;
} {
  const dateStr = scheduledDate.toISOString().split('T')[0];
  const timeStr = scheduledTime.toISOString().split('T')[1];

  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const formattedTime = `${hour12}:${mStr} ${ampm}`;

  return {
    formattedDate,
    formattedTime,
    formattedDateTime: `${formattedDate} at ${formattedTime}`,
  };
}
