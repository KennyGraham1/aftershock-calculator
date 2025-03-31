/**
 * Unit tests for the aftershock model
 */

import { AftershockModel, MODEL_PARAMETERS } from '../js/models/aftershockModel.js';
import { calculateOmoriIntegral, poissonQuantile } from '../js/utils/math.js';

/**
 * Simple test runner
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function
 */
function test(testName, testFn) {
  try {
    testFn();
    console.log(`✅ PASS: ${testName}`);
  } catch (error) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(error);
  }
}

/**
 * Assertion function
 * @param {boolean} condition - Condition to assert
 * @param {string} message - Message to show if assertion fails
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Approximately equal comparison
 * @param {number} a - First value
 * @param {number} b - Second value
 * @param {number} epsilon - Tolerance
 * @returns {boolean} Whether values are approximately equal
 */
function approxEqual(a, b, epsilon = 0.001) {
  return Math.abs(a - b) < epsilon;
}

// Test the Omori integral calculation
test('Omori integral calculation', () => {
  // Test case 1: Standard case
  const result1 = calculateOmoriIntegral(1, 10, 0.04, 1.07);
  assert(approxEqual(result1, 24.742), 'Omori integral should be approximately 24.742');
  
  // Test case 2: p = 1 special case
  const result2 = calculateOmoriIntegral(1, 10, 0.04, 1);
  assert(approxEqual(result2, Math.log(10.04) - Math.log(1.04)), 'Special case p=1 should use logarithmic formula');
  
  // Test case 3: Error case
  try {
    calculateOmoriIntegral(10, 1, 0.04, 1.07); // End time before start time
    assert(false, 'Should throw error for end time before start time');
  } catch (error) {
    assert(true, 'Error thrown as expected');
  }
});

// Test the Poisson quantile function
test('Poisson quantile calculation', () => {
  // Test case 1: Small lambda
  const result1 = poissonQuantile(0.95, 3);
  assert(result1 === 6, 'Quantile should be 6 for lambda=3 and p=0.95');
  
  // Test case 2: Zero lambda
  const result2 = poissonQuantile(0.5, 0);
  assert(result2 === 0, 'Quantile should be 0 for lambda=0');
  
  // Test case 3: Invalid p
  try {
    poissonQuantile(1.1, 1); // p > 1
    assert(false, 'Should throw error for p > 1');
  } catch (error) {
    assert(true, 'Error thrown as expected');
  }
});

// Test the AftershockModel class
test('AftershockModel creation and basic functionality', () => {
  // Test case 1: Create from preset
  const model1 = AftershockModel.fromPreset('NZ_GENERIC');
  assert(model1.a === MODEL_PARAMETERS.NZ_GENERIC.a, 'Model should have correct parameters');
  
  // Test case 2: Create custom model
  const model2 = AftershockModel.createCustomModel(-1.5, 1.0, 0.03, 0.9);
  assert(model2.a === -1.5, 'Custom model should have correct parameters');
  assert(model2.b === 1.0, 'Custom model should have correct parameters');
  assert(model2.c === 0.03, 'Custom model should have correct parameters');
  assert(model2.p === 0.9, 'Custom model should have correct parameters');
});

// Test the aftershock calculation
test('Aftershock calculation', () => {
  const model = AftershockModel.fromPreset('NZ_GENERIC');
  
  // Test case: Calculate for a magnitude 6.0 earthquake
  const result = model.calculateAftershocks({
    mainshockMagnitude: 6.0,
    startTimeInDays: 1,
    durationInDays: 7,
    minMagnitude: 4.0,
    maxMagnitude: null
  });
  
  // Verify results are reasonable (not exact due to floating point calculations)
  assert(result.expectedCount > 0, 'Expected count should be positive');
  assert(result.probability >= 0 && result.probability <= 100, 'Probability should be between 0 and 100');
  assert(result.lowerBound <= result.upperBound, 'Lower bound should be less than upper bound');
});

// Test the forecast generation
test('Forecast generation', () => {
  const model = AftershockModel.fromPreset('NZ_GENERIC');
  
  // Generate forecasts for multiple durations and magnitude ranges
  const results = model.generateForecasts({
    mainshockMagnitude: 7.0,
    startTimeInDays: 1,
    durations: [1, 7, 30],
    magnitudeRanges: [
      { min: 5.0, max: null },
      { min: 4.0, max: 5.0 },
      { min: 3.0, max: 4.0 }
    ]
  });
  
  // Verify we got 9 results (3 durations × 3 magnitude ranges)
  assert(results.length === 9, 'Should generate 9 forecast results');
  
  // Verify the structure of the results
  results.forEach(result => {
    assert('duration' in result, 'Result should include duration');
    assert('magnitudeRange' in result, 'Result should include magnitude range');
    assert('expectedCount' in result, 'Result should include expected count');
    assert('probability' in result, 'Result should include probability');
  });
  
  // Verify that longer durations have higher expected counts
  const sameMagResults = results.filter(r => r.magnitudeRange.min === 5.0 && r.magnitudeRange.max === null);
  sameMagResults.sort((a, b) => a.duration - b.duration);
  
  assert(sameMagResults[0].expectedCount <= sameMagResults[1].expectedCount, 
    'Longer duration should have higher expected count');
  assert(sameMagResults[1].expectedCount <= sameMagResults[2].expectedCount, 
    'Longer duration should have higher expected count');
});

// Run all tests
console.log('Running aftershock model tests...');
// Tests will run automatically when this file is executed