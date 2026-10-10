export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  
  let hStr = '';
  let mStr = '';

  // Case 1: HH:MM or HH:MM:SS format directly
  if (/^\d{2}:\d{2}/.test(timeString)) {
    const parts = timeString.split(':');
    hStr = parts[0];
    mStr = parts[1];
  } 
  // Case 2: ISO String 1970-01-01T08:00:00.000Z
  else if (timeString.includes('T')) {
    const timePart = timeString.split('T')[1]; // "08:00:00.000Z"
    hStr = timePart.substring(0, 2);
    mStr = timePart.substring(3, 5);
  } else {
    return timeString;
  }

  const hour = parseInt(hStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${mStr} ${ampm}`;
};
