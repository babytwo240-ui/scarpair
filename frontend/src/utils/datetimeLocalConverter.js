/**
 * Convert datetime-local input to Manila time format for backend
 * 
 * IMPORTANT: This is a Philippines app. Users input times in MANILA TIMEZONE regardless
 * of their browser's local timezone. The datetime-local HTML input is naive (no timezone),
 * so we interpret it AS MANILA TIME.
 * 
 * The backend's parseUserInputAsManillaTime() expects a Manila time string and will
 * convert it to UTC for storage.
 */

export const convertBrowserLocalToManilaTime = (dateTimeLocalString) => {
  if (!dateTimeLocalString) return '';

  // The datetime-local input is a naive string: "2026-03-03T10:20"
  // We simply interpret this AS MANILA TIME (as if the user selected it in Manila timezone)
  // and pass it directly to the backend
  return dateTimeLocalString; // Pass through as-is - it's already Manila time in the format backend expects
};

