/**
 * Input validation utilities
 */

/**
 * Validate quake ID format
 * @param {string} quakeId - The quake ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidQuakeId(quakeId) {
  // Validate the quake ID format (alphanumeric, correct length)
  return /^[0-9a-z]{11}$/.test(quakeId);
}

/**
 * Validate magnitude value
 * @param {number} magnitude - The magnitude value to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMagnitude(magnitude) {
  // Magnitude should be a number between 0 and 10
  return !isNaN(magnitude) && magnitude >= 0 && magnitude < 10;
}

/**
 * Validate time difference between quake time and aftershock start time
 * @param {Date} quakeTime - Time of the main quake
 * @param {Date} aftershockStartTime - Start time for aftershock calculations
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidTimeSequence(quakeTime, aftershockStartTime) {
  // Ensure aftershock time is after quake time
  return quakeTime < aftershockStartTime;
}

/**
 * Validate forecast duration
 * @param {number} duration - Duration in days
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidDuration(duration) {
  // Duration should be between 1 and 730 days (2 years)
  return !isNaN(duration) && duration >= 1 && duration <= 730;
}

/**
 * Validate magnitude ranges
 * @param {number} m1 - Highest magnitude threshold
 * @param {number} m2 - Middle magnitude threshold
 * @param {number} m3 - Lowest magnitude threshold
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMagnitudeRanges(m1, m2, m3) {
  // Ensure all are numbers and in descending order
  return (
    !isNaN(m1) && !isNaN(m2) && !isNaN(m3) &&
    m1 > m2 && m2 > m3 &&
    m1 <= 8 && m3 >= 1
  );
}

/**
 * Validate Omori-Utsu law parameters
 * @param {number} a - Productivity parameter
 * @param {number} b - Gutenberg-Richter b-value
 * @param {number} c - Time offset parameter
 * @param {number} p - Decay rate parameter
 * @returns {object} Object with isValid and errorMessage properties
 */
export function validateModelParameters(a, b, c, p) {
  const result = { isValid: true, errorMessage: "" };
  
  if (isNaN(a) || a > 0 || a < -2) {
    result.isValid = false;
    result.errorMessage = "Parameter 'a' must be between -2 and 0";
    return result;
  }
  
  if (isNaN(b) || b <= 0 || b > 2) {
    result.isValid = false;
    result.errorMessage = "Parameter 'b' must be between 0 and 2";
    return result;
  }
  
  if (isNaN(c) || c <= 0 || c > 0.1) {
    result.isValid = false;
    result.errorMessage = "Parameter 'c' must be positive and not greater than 0.1";
    return result;
  }
  
  if (isNaN(p) || p < 0.5 || p > 2) {
    result.isValid = false;
    result.errorMessage = "Parameter 'p' must be between 0.5 and 2";
    return result;
  }
  
  return result;
}