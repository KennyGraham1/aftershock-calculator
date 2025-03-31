/**
 * View module for the aftershock calculator
 * Handles UI updates and display of results
 */

import { formatPercentage } from '../utils/math.js';
import { clearResults as clearResultsUI, updateElement } from '../utils/ui.js';

/**
 * Display quake information in the UI
 * @param {Object} quakeData - Data about the earthquake
 */
export function displayQuakeInfo(quakeData) {
  const { id, magnitude, time, depth, location } = quakeData;
  
  // Update UI elements with quake data
  document.getElementById('mag').value = magnitude;
  document.getElementById('quakeTime').value = time;
  
  // Display additional info if available
  const infoElement = document.getElementById('info');
  if (infoElement) {
    let infoText = `Quake ID: ${id}`;
    
    if (depth !== undefined) {
      infoText += `, Depth: ${typeof depth === 'number' ? depth.toFixed(1) : depth} km`;
    }
    
    if (location) {
      infoText += `, Location: ${location}`;
    }
    
    infoElement.textContent = infoText;
  }
}

/**
 * Display magnitude ranges in the UI
 * @param {Object} magnitudes - Object containing m1, m2, m3 values
 */
export function displayMagnitudeRanges(magnitudes) {
  const { m1, m2, m3 } = magnitudes;
  
  // Update UI elements with magnitude ranges
  document.getElementById('M1').value = m1;
  document.getElementById('M2').value = m2;
  document.getElementById('M3').value = m3;
  
  // Update headers in results table
  updateElement('Range1', `M${m1}+`);
  updateElement('Range2', `M${m2}-M${m1}`);
  updateElement('Range3', `M${m3}-M${m2}`);
}

/**
 * Clear all results from the UI
 * @param {boolean} modelOnly - Whether to only clear model parameters
 */
export function clearResults(modelOnly = false) {
  if (modelOnly) {
    // Only clear model parameters if changing model type
    return;
  }
  
  // Use the utility function to clear all result elements
  clearResultsUI();
}

/**
 * Display durations in the table headers
 * @param {Array<number>} durations - Array of durations in days
 */
export function displayDurations(durations) {
  const durationElements = ['within_d1', 'within_d2', 'within_d3'];
  
  durations.forEach((duration, index) => {
    if (index < durationElements.length) {
      updateElement(durationElements[index], `within ${duration} days`);
    }
  });
}

/**
 * Display calculation results in the UI
 * @param {Array<Object>} results - Array of calculation results
 * @param {string} quakeId - ID of the quake
 */
export function displayResults(results, quakeId) {
  // Set quake ID
  updateElement('qID', quakeId);
  
  // Group results by duration and magnitude range
  const resultsByDuration = {};
  results.forEach(result => {
    const durationKey = `d${results.indexOf(result) % 3 + 1}`;
    const magnitudeIndex = Math.floor(results.indexOf(result) / 3) + 1;
    
    if (!resultsByDuration[durationKey]) {
      resultsByDuration[durationKey] = {};
    }
    
    resultsByDuration[durationKey][`M${magnitudeIndex}`] = result;
  });
  
  // Update the table with results
  Object.keys(resultsByDuration).forEach(durationKey => {
    const durationResults = resultsByDuration[durationKey];
    
    [1, 2, 3].forEach(magIndex => {
      const result = durationResults[`M${magIndex}`];
      if (result) {
        // Update average number
        updateElement(`M${magIndex}R_${durationKey}`, result.formattedExpectedCount);
        
        // Update range (prediction interval)
        updateElement(`M${magIndex}A_${durationKey}`, result.predictionInterval);
        
        // Update probability
        updateElement(`M${magIndex}P_${durationKey}`, formatPercentage(result.probability));
      }
    });
  });
}

/**
 * Create a chart for aftershock forecasts
 * This function requires Chart.js to be loaded
 * @param {Array<Object>} results - Array of calculation results
 * @param {string} containerId - ID of the container element
 */
export function createForecastChart(results, containerId) {
  // Return early if Chart.js is not available
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not available. The chart will not be rendered.');
    return;
  }
  
  // Get the container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found.`);
    return;
  }
  
  try {
    // Clear any existing content in the container
    container.innerHTML = '';
    
    // Create a canvas element for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'forecastChart';
    container.appendChild(canvas);
    
    // Create labels for duration axis based on actual durations
    const uniqueDurations = [...new Set(results.map(result => result.duration))];
    uniqueDurations.sort((a, b) => a - b);
    const labels = uniqueDurations.map(duration => `${duration} days`);
    
    // Group results by magnitude range
    const resultsByMagnitude = {};
    
    // First, identify magnitude ranges
    const magnitudeRanges = [...new Set(results.map(result => {
      const min = result.magnitudeRange.min;
      const max = result.magnitudeRange.max;
      
      if (max === null) {
        return `M${min}+`;
      } else {
        return `M${min}-M${max}`;
      }
    }))];
    
    // Group results by magnitude range
    magnitudeRanges.forEach(rangeLabel => {
      resultsByMagnitude[rangeLabel] = [];
      
      // Find all results for this magnitude range
      results.forEach(result => {
        const min = result.magnitudeRange.min;
        const max = result.magnitudeRange.max;
        const resultLabel = max === null ? `M${min}+` : `M${min}-M${max}`;
        
        if (resultLabel === rangeLabel) {
          resultsByMagnitude[rangeLabel].push(result);
        }
      });
      
      // Sort by duration
      resultsByMagnitude[rangeLabel].sort((a, b) => a.duration - b.duration);
    });
    
    // Prepare chart data
    const datasets = [];
    const colors = ['#4bc0c0', '#ff6384', '#36a2eb', '#ffcd56', '#9966ff', '#ff9f40'];
    
    // Create a dataset for each magnitude range
    Object.keys(resultsByMagnitude).forEach((rangeLabel, index) => {
      const rangeResults = resultsByMagnitude[rangeLabel];
      
      // Create a map of duration -> probability for this range
      const dataByDuration = {};
      uniqueDurations.forEach(duration => {
        dataByDuration[duration] = null; // Initialize with null (no data)
      });
      
      // Fill in actual data
      rangeResults.forEach(result => {
        dataByDuration[result.duration] = result.probability;
      });
      
      // Create the dataset
      datasets.push({
        label: rangeLabel,
        data: uniqueDurations.map(duration => dataByDuration[duration]),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1
      });
    });
    
    // Create the chart
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Probability (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Forecast Period'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Aftershock Probability Forecast',
            font: {
              size: 16
            }
          },
          subtitle: {
            display: true,
            text: 'Probability of one or more aftershocks in each magnitude range',
            font: {
              size: 12,
              style: 'italic'
            },
            padding: {
              bottom: 10
            }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.parsed.y === null) {
                  return `${context.dataset.label}: No data`;
                }
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
    
    // Add a caption
    const caption = document.createElement('p');
    caption.className = 'text-muted text-center mt-2';
    caption.innerHTML = 'This chart shows the probability of experiencing one or more aftershocks in each magnitude range over different time periods.';
    container.appendChild(caption);
    
  } catch (error) {
    console.error('Error creating chart:', error);
    
    // Show error message in the container
    container.innerHTML = `
      <div class="alert alert-warning">
        <h4>Visualization Error</h4>
        <p>Unable to create the visualization chart. Error: ${error.message}</p>
      </div>
    `;
  }
}