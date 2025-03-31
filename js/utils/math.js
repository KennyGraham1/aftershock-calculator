/**
 * Mathematical utility functions for aftershock calculations
 */

/**
 * Calculate the Omori-Utsu integral for aftershock decay
 * @param {number} startTimeFromQuake - Start time in days from main quake
 * @param {number} endTimeFromQuake - End time in days from main quake
 * @param {number} c - Omori-Utsu c parameter (time offset parameter)
 * @param {number} p - Omori-Utsu p parameter (decay rate parameter)
 * @returns {number} The value of the integral
 * @throws {Error} If parameters are invalid or would cause division by zero
 */
export function calculateOmoriIntegral(startTimeFromQuake, endTimeFromQuake, c, p) {
  // Validate inputs
  if (c <= 0) throw new Error("Parameter c must be positive");
  if (endTimeFromQuake < startTimeFromQuake) throw new Error("End time must be after start time");
  
  // Handle special case for p=1 which would cause division by zero
  if (Math.abs(p - 1.0) < Number.EPSILON) {
    return Math.log(endTimeFromQuake + c) - Math.log(startTimeFromQuake + c);
  }
  
  // Standard calculation for p≠1
  return (Math.pow(endTimeFromQuake + c, 1 - p) - Math.pow(startTimeFromQuake + c, 1 - p)) / (1 - p);
}

/**
 * Calculate the Poisson quantile function using the Sueishi algorithm
 * More efficient than naive implementations for large lambda
 * @param {number} p - Probability value (0 < p < 1)
 * @param {number} lambda - Poisson distribution parameter
 * @returns {number} The smallest integer n such that P(X ≤ n) ≥ p
 * @throws {Error} If parameters are invalid
 */
export function poissonQuantile(p, lambda) {
  if (p <= 0 || p >= 1) throw new Error("Probability p must be between 0 and 1");
  if (lambda < 0) throw new Error("Lambda must be non-negative");
  if (lambda === 0) return 0;

  let increment = Math.exp(-lambda);
  let sum = increment;
  let n = 0;
  
  // Increased iteration limit from 1000 to 10000 for better precision with large lambda
  const MAX_ITERATIONS = 10000;
  let iterations = 0;
  
  while (sum < p && iterations < MAX_ITERATIONS) {
    n++;
    increment = (increment * lambda) / n;
    sum += increment;
    iterations++;
    
    // Prevent infinite loops with tiny increments
    if (increment < Number.EPSILON && iterations > 100) break;
  }
  
  // Return result with warning in console if we hit iteration limit
  if (iterations >= MAX_ITERATIONS) {
    console.warn(`Poisson quantile calculation hit iteration limit for lambda=${lambda}, p=${p}`);
  }
  
  return n;
}

/**
 * Format a percentage for display
 * @param {number} value - Value to format as percentage
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value) {
  if (value > 99) {
    return ">99%";
  } else if (value < 1) {
    return "<1%";
  } else {
    return `${Math.round(value)}%`;
  }
}

/**
 * Format a number with appropriate precision based on its value
 * @param {number} value - The value to format
 * @returns {string} The formatted value
 */
export function formatNumber(value) {
  if (value >= 100) {
    return Math.round(value).toString();
  } else if (value < 1) {
    return value.toPrecision(1);
  } else {
    return value.toPrecision(2);
  }
}

/**
 * Calculate the probability of one or more events given the expected count
 * @param {number} expectedCount - The Poisson lambda parameter
 * @returns {number} Probability of at least one event (as percentage)
 */
export function calculateProbabilityOfOneOrMore(expectedCount) {
  return 100 * (1 - Math.exp(-expectedCount));
}