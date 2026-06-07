/**
 * Formats a time string to HH:MM 24-hour format.
 * Handles inputs like "08:00:00", "8:00", "14:30", etc.
 * @param {string} timeString 
 * @returns {string} Time in HH:MM format
 */
export const formatTime24Hour = (timeString) => {
  if (!timeString) return '';
  
  // If it's already in HH:MM format (simple check)
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  try {
    // Handle "HH:MM:SS" or other formats
    const [hours, minutes] = timeString.split(':');
    
    if (hours === undefined || minutes === undefined) return timeString;

    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
};

/**
 * Validates if a string is in valid HH:MM 24-hour format.
 * @param {string} timeString 
 * @returns {boolean}
 */
export const isValidTime24Hour = (timeString) => {
  if (!timeString) return false;
  // Regex for HH:MM (00:00 to 23:59)
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
};

/**
 * Parses a time string into an object with hours and minutes.
 * @param {string} timeString 
 * @returns {{hours: number, minutes: number}|null}
 */
export const parseTime24Hour = (timeString) => {
  if (!isValidTime24Hour(timeString)) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Generates hourly slots between start and end time.
 * @param {string} start HH:MM
 * @param {string} end HH:MM
 * @returns {string[]} Array of HH:MM strings
 */
export const generateHourlySlots = (start, end) => {
  const slots = [];
  let current = parseTime24Hour(start);
  const endTime = parseTime24Hour(end);
  
  if (!current || !endTime) return [];

  while (current.hours < endTime.hours || (current.hours === endTime.hours && current.minutes < endTime.minutes)) {
    const timeStr = `${String(current.hours).padStart(2, '0')}:${String(current.minutes).padStart(2, '0')}`;
    slots.push(timeStr);
    
    // Increment by 1 hour
    current.hours += 1;
  }
  
  return slots;
};