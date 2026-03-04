/**
 * Philippine Time Formatter - FRONTEND version
 * Uses the same logic as backend's philippineTimeUtil.ts
 * Single source of truth: UTC in database, Manila time for display only
 */

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8 in milliseconds

/**
 * Convert UTC timestamp to Manila local time string
 * Used for displaying all UTC timestamps (requestDate, scheduledDate, createdAt, etc.)
 * Returns: "MM/DD/YYYY, HH:MM:SS AM/PM"
 */
export const formatManila = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';

  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  // Add 8 hours to convert UTC to Manila local time
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  // Extract components using UTC methods (since we already offset by 8 hours)
  const year = manilaDate.getUTCFullYear();
  const month = String(manilaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getUTCDate()).padStart(2, '0');
  const hours = manilaDate.getUTCHours();
  const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
  
  // Convert to 12-hour format
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  return `${month}/${day}/${year}, ${displayHours}:${minutes}:${seconds} ${meridiem}`;
};

/**
 * Same as formatManila - both use identical logic
 * Formatsingles dates from database (all are UTC) to Manila display time
 */
export const formatManilaInput = (isoStringOrDate) => {
  // Use identical logic to formatManila
  return formatManila(isoStringOrDate);
};

/**
 * Format UTC Date to Manila date only (no time)
 * Returns something like "3/1/2026"
 */
export const formatManilaDayOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';
  
  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  // Add 8 hours to convert UTC to Manila local time
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  const year = manilaDate.getUTCFullYear();
  const month = manilaDate.getUTCMonth() + 1;
  const day = manilaDate.getUTCDate();
  
  return `${month}/${day}/${year}`;
};

/**
 * Format UTC Date to Manila time only (no date)
 * Returns something like "6:35:00 PM"
 */
export const formatManilaTimeOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';
  
  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  // Add 8 hours to convert UTC to Manila local time
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  const hours = manilaDate.getUTCHours();
  const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
  
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  return `${displayHours}:${minutes}:${seconds} ${meridiem}`;
};

export default {
  formatManila,
  formatManilaInput,
  formatManilaDayOnly,
  formatManilaTimeOnly,
  MANILA_OFFSET_MS
};
