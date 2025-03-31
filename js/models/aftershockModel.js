/**
 * Aftershock forecasting model using Modified Omori Law
 * 
 * The Modified Omori Law describes the decay of aftershock rates over time:
 * n(t) = K / (t + c)^p
 * 
 * where:
 * - n(t) is the rate of aftershocks at time t after the mainshock
 * - K is related to the productivity (10^a * 10^(b * (M - M0)))
 * - c is a time offset parameter
 * - p is the decay rate parameter
 * 
 * The aftershock rate also depends on the magnitude difference between the mainshock
 * and the aftershocks, following the Gutenberg-Richter relationship:
 * N(M) = 10^(a + b * (M - M0))
 * 
 * where:
 * - N(M) is the number of earthquakes with magnitude >= M
 * - a is the productivity parameter
 * - b is the Gutenberg-Richter b-value
 * - M is the mainshock magnitude
 * - M0 is the minimum magnitude of interest
 */

import { calculateOmoriIntegral, poissonQuantile, formatNumber, calculateProbabilityOfOneOrMore } from '../utils/math.js';

/**
 * Model parameters for different tectonic environments
 */
export const MODEL_PARAMETERS = {
  NZ_GENERIC: {
    name: 'New Zealand Generic',
    a: -1.59,
    b: 1.03,
    c: 0.04,
    p: 1.07
  },
  SUBDUCTION_ZONE: {
    name: 'Subduction Zone',
    a: -1.97,
    b: 1.0,
    c: 0.018,
    p: 0.92
  }
};

/**
 * Main aftershock calculation class
 */
export class AftershockModel {
  /**
   * Create a new aftershock model
   * @param {Object} params - Model parameters
   * @param {number} params.a - Productivity parameter
   * @param {number} params.b - Gutenberg-Richter b-value
   * @param {number} params.c - Time offset parameter
   * @param {number} params.p - Decay rate parameter
   */
  constructor(params) {
    this.a = params.a;
    this.b = params.b;
    this.c = params.c;
    this.p = params.p;
  }
  
  /**
   * Calculate expected number of aftershocks for a specific magnitude range and time period
   * @param {Object} options - Calculation options
   * @param {number} options.mainshockMagnitude - Magnitude of the mainshock
   * @param {number} options.startTimeInDays - Start time in days from mainshock
   * @param {number} options.durationInDays - Duration of the forecast period in days
   * @param {number} options.minMagnitude - Minimum magnitude threshold
   * @param {number} options.maxMagnitude - Maximum magnitude threshold (null for no upper limit)
   * @returns {Object} Calculation results
   */
  calculateAftershocks(options) {
    try {
      const {
        mainshockMagnitude,
        startTimeInDays,
        durationInDays,
        minMagnitude,
        maxMagnitude = null
      } = options;
      
      // Calculate end time
      const endTimeInDays = startTimeInDays + durationInDays;
      
      // Calculate the Omori integral for this time period
      const omoriIntegral = calculateOmoriIntegral(
        startTimeInDays,
        endTimeInDays,
        this.c,
        this.p
      );
      
      // Calculate expected number of aftershocks above minMagnitude
      // Using M-0.05 to account for half-unit magnitude binning
      const productivityMin = Math.pow(10, this.a + this.b * (mainshockMagnitude - (minMagnitude - 0.05)));
      const expectedCountMin = productivityMin * omoriIntegral;
      
      // If there's a max magnitude, calculate for that range
      let expectedCount;
      if (maxMagnitude !== null) {
        const productivityMax = Math.pow(10, this.a + this.b * (mainshockMagnitude - (maxMagnitude - 0.05)));
        const expectedCountMax = productivityMax * omoriIntegral;
        expectedCount = expectedCountMin - expectedCountMax;
      } else {
        expectedCount = expectedCountMin;
      }
      
      // Calculate probability of one or more events
      const probability = calculateProbabilityOfOneOrMore(expectedCount);
      
      // Calculate prediction intervals (95% confidence)
      const lowerBound = poissonQuantile(0.025, expectedCount);
      const upperBound = poissonQuantile(0.975, expectedCount);
      
      // Format the output values
      const formattedExpectedCount = formatNumber(expectedCount);
      const predictionInterval = `${lowerBound}-${upperBound}`;
      
      return {
        expectedCount,
        formattedExpectedCount,
        lowerBound,
        upperBound,
        predictionInterval,
        probability,
        durationInDays
      };
    } catch (error) {
      console.error('Error in aftershock calculation:', error);
      throw error;
    }
  }
  
  /**
   * Calculate forecasts for multiple magnitude ranges and durations
   * @param {Object} options - Forecast options
   * @param {number} options.mainshockMagnitude - Magnitude of mainshock
   * @param {number} options.startTimeInDays - Days since the mainshock
   * @param {Array<number>} options.durations - Array of forecast durations in days
   * @param {Array<{min: number, max: number}>} options.magnitudeRanges - Array of magnitude ranges
   * @returns {Array<Object>} Array of forecast results
   */
  generateForecasts(options) {
    const {
      mainshockMagnitude,
      startTimeInDays,
      durations,
      magnitudeRanges
    } = options;
    
    const results = [];
    
    durations.forEach(duration => {
      magnitudeRanges.forEach(range => {
        const result = this.calculateAftershocks({
          mainshockMagnitude,
          startTimeInDays,
          durationInDays: duration,
          minMagnitude: range.min,
          maxMagnitude: range.max
        });
        
        results.push({
          duration,
          magnitudeRange: range,
          ...result
        });
      });
    });
    
    return results;
  }
  
  /**
   * Create a model instance from predefined parameter set
   * @param {string} modelType - Type of model ('NZ_GENERIC' or 'SUBDUCTION_ZONE')
   * @returns {AftershockModel} New model instance
   */
  static fromPreset(modelType) {
    if (!MODEL_PARAMETERS[modelType]) {
      throw new Error(`Unknown model type: ${modelType}`);
    }
    
    return new AftershockModel(MODEL_PARAMETERS[modelType]);
  }
  
  /**
   * Create a custom model with user-defined parameters
   * @param {number} a - Productivity parameter
   * @param {number} b - Gutenberg-Richter b-value
   * @param {number} c - Time offset parameter
   * @param {number} p - Decay rate parameter
   * @returns {AftershockModel} New model instance
   */
  static createCustomModel(a, b, c, p) {
    return new AftershockModel({ a, b, c, p });
  }
}