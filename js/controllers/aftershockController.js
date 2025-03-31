/**
 * Controller module for the aftershock calculator
 * Handles user interactions and coordinates model and view operations
 */

import { AftershockModel } from '../models/aftershockModel.js';
import * as aftershockView from '../views/aftershockView.js';
import { fetchQuakeData, calculateMagnitudeThresholds, exportToCSV, downloadCSV } from '../services/quakeService.js';
import * as validation from '../utils/validation.js';
import { showValidationError, setModelParameters, enableCalculateButton, disableCalculateButton } from '../utils/ui.js';

/**
 * Format a Date object to the format required by datetime-local inputs
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in the format YYYY-MM-DDThh:mm
 */
function formatDateTimeForInput(date) {
  // Get components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // Create the formatted string
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// State variables
let currentQuakeData = null;
let currentModel = null;

/**
 * Initialize the controller
 */
export function init() {
  // Set up event listeners
  document.getElementById('loadQ').addEventListener('click', handleLoadQuake);
  document.getElementById('doAfters').addEventListener('click', handleCalculate);
  
  // Set up model type selection listeners
  document.getElementById('nz').addEventListener('change', () => handleModelTypeChange('NZ_GENERIC'));
  document.getElementById('sz').addEventListener('change', () => handleModelTypeChange('SUBDUCTION_ZONE'));
  document.getElementById('cm').addEventListener('change', () => handleModelTypeChange('CUSTOM'));
  
  // Set up input change listeners for validation
  document.getElementById('mag').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('quakeTime').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('startTime').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('duration_d1').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('duration_d2').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('duration_d3').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('M1').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('M2').addEventListener('change', () => aftershockView.clearResults());
  document.getElementById('M3').addEventListener('change', () => aftershockView.clearResults());
  
  // Set model parameters for NZ Generic as default
  handleModelTypeChange('NZ_GENERIC');
  
  // Add export button
  addExportButton();
  
  // Set up enhanced print functionality
  setupPrintFunctionality();
}

/**
 * Handle quake loading
 * @param {Event} event - Click event
 */
async function handleLoadQuake(event) {
  event.preventDefault();
  
  const quakeIdInput = document.getElementById('QuakeID');
  const quakeId = quakeIdInput.value;
  
  try {
    // Validate quake ID
    if (!validation.isValidQuakeId(quakeId)) {
      showValidationError('Invalid QuakeID: must be 11 alphanumeric characters', 'QuakeID');
      return;
    }
    
    // Fetch quake data
    currentQuakeData = await fetchQuakeData(quakeId);
    
    // Format dates for datetime-local inputs
    const quakeDate = new Date(currentQuakeData.time);
    const startDate = new Date(); // Current time for start time
    
    // Format dates in the required format for datetime-local: YYYY-MM-DDThh:mm
    const quakeDateFormatted = formatDateTimeForInput(quakeDate);
    const startDateFormatted = formatDateTimeForInput(startDate);
    
    // Update quake data with formatted dates
    const quakeDataWithFormattedDates = {
      ...currentQuakeData,
      time: quakeDateFormatted
    };
    
    // Display quake info in UI
    aftershockView.displayQuakeInfo(quakeDataWithFormattedDates);
    
    // Calculate default magnitude thresholds
    const magnitudes = calculateMagnitudeThresholds(currentQuakeData.magnitude);
    
    // Display magnitude ranges
    aftershockView.displayMagnitudeRanges(magnitudes);
    
    // Set current time as start time
    document.getElementById('startTime').value = startDateFormatted;
    
    // Enable calculate button
    enableCalculateButton();
  } catch (error) {
    console.error('Error loading quake:', error);
    showValidationError(`Error loading quake: ${error.message}`);
    
    // Disable calculate button
    disableCalculateButton();
  }
}

/**
 * Handle model type change
 * @param {string} modelType - Type of model selected
 */
function handleModelTypeChange(modelType) {
  // Clear previous results
  aftershockView.clearResults(true);
  
  if (modelType === 'CUSTOM') {
    // Enable custom parameter inputs
    setModelParameters('cm');
  } else {
    // Set predefined parameters and disable inputs
    setModelParameters(modelType === 'NZ_GENERIC' ? 'nz' : 'sz');
    
    // Create model instance
    currentModel = AftershockModel.fromPreset(modelType);
  }
}

/**
 * Handle calculation
 * @param {Event} event - Click event
 */
function handleCalculate(event) {
  event.preventDefault();
  
  try {
    // Get input values
    const magnitude = parseFloat(document.getElementById('mag').value);
    
    // Parse dates from datetime-local inputs
    const quakeTimeValue = document.getElementById('quakeTime').value;
    const startTimeValue = document.getElementById('startTime').value;
    
    // Validate date inputs
    if (!quakeTimeValue || !startTimeValue) {
      showValidationError('Quake time and start time are required', quakeTimeValue ? 'startTime' : 'quakeTime');
      return;
    }
    
    const quakeTime = new Date(quakeTimeValue);
    const startTime = new Date(startTimeValue);
    
    const duration1 = parseInt(document.getElementById('duration_d1').value);
    const duration2 = parseInt(document.getElementById('duration_d2').value);
    const duration3 = parseInt(document.getElementById('duration_d3').value);
    const m1 = parseFloat(document.getElementById('M1').value);
    const m2 = parseFloat(document.getElementById('M2').value);
    const m3 = parseFloat(document.getElementById('M3').value);
    
    // Validate inputs
    if (!validation.isValidMagnitude(magnitude)) {
      showValidationError('Magnitude must be between 0 and 10', 'mag');
      return;
    }
    
    if (!validation.isValidTimeSequence(quakeTime, startTime)) {
      showValidationError('Start time must be after quake time', 'startTime');
      return;
    }
    
    if (!validation.isValidDuration(duration1) || 
        !validation.isValidDuration(duration2) || 
        !validation.isValidDuration(duration3)) {
      showValidationError('Duration must be between 1 and 730 days');
      return;
    }
    
    if (!validation.isValidMagnitudeRanges(m1, m2, m3)) {
      showValidationError('Magnitude ranges must be in descending order (e.g. 5,4,3) and not larger than 8');
      return;
    }
    
    // Get model parameters
    let a, b, c, p;
    
    if (document.getElementById('cm').checked) {
      // Get custom parameters
      a = parseFloat(document.getElementById('a').value);
      b = parseFloat(document.getElementById('b').value);
      c = parseFloat(document.getElementById('c').value);
      p = parseFloat(document.getElementById('p').value);
      
      // Validate model parameters
      const validationResult = validation.validateModelParameters(a, b, c, p);
      if (!validationResult.isValid) {
        showValidationError(validationResult.errorMessage);
        return;
      }
      
      // Create custom model
      currentModel = AftershockModel.createCustomModel(a, b, c, p);
    } else if (!currentModel) {
      // Create default model if none exists
      currentModel = AftershockModel.fromPreset('NZ_GENERIC');
    }
    
    // Calculate days since the earthquake
    const startTimeFromQuake = (startTime - quakeTime) / (1000 * 60 * 60 * 24);
    
    // Define magnitude ranges
    const magnitudeRanges = [
      { min: m1, max: null },     // M1+
      { min: m2, max: m1 },       // M2-M1
      { min: m3, max: m2 }        // M3-M2
    ];
    
    // Generate forecasts
    const durations = [duration1, duration2, duration3];
    const results = currentModel.generateForecasts({
      mainshockMagnitude: magnitude,
      startTimeInDays: startTimeFromQuake,
      durations,
      magnitudeRanges
    });
    
    // Display durations in table
    aftershockView.displayDurations(durations);
    
    // Display results
    aftershockView.displayResults(results, currentQuakeData?.id || '');
    
    // Update visualization
    try {
      // Show the visualization section (in case it was hidden)
      const visualizationSection = document.getElementById('VisualizationSection');
      if (visualizationSection) {
        visualizationSection.style.display = 'block';
      }
      
      // Hide the initial message
      const noDataMessage = document.getElementById('noDataMessage');
      if (noDataMessage) {
        noDataMessage.style.display = 'none';
      }
      
      // Create/update the chart
      aftershockView.createForecastChart(results, 'chartContainer');
    } catch (error) {
      console.error('Error creating visualization:', error);
      
      // Show a message that we need Chart.js
      const chartContainer = document.getElementById('chartContainer');
      if (chartContainer) {
        chartContainer.innerHTML = `
          <div class="alert alert-info text-center">
            <p>Visualization requires Chart.js, which could not be loaded.</p>
            <p>The forecast calculations are still correct and shown in the table above.</p>
          </div>
        `;
      }
    }
    
    // Store results for export
    window.lastResults = {
      quakeData: currentQuakeData,
      results
    };
  } catch (error) {
    console.error('Error calculating aftershocks:', error);
    showValidationError(`Error in calculation: ${error.message}`);
  }
}

/**
 * Add export button to UI
 */
function addExportButton() {
  const buttonContainer = document.querySelector('.btn[onclick="window.print()"]').parentNode;
  
  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'btn btn-outline-info';
  exportButton.title = 'Export results to CSV';
  exportButton.setAttribute('aria-expanded', 'true');
  exportButton.textContent = 'Export to CSV';
  exportButton.style.marginLeft = '10px';
  
  exportButton.addEventListener('click', () => {
    if (window.lastResults) {
      const csvData = exportToCSV(
        window.lastResults.quakeData, 
        window.lastResults.results
      );
      
      downloadCSV(csvData, `aftershock-forecast-${window.lastResults.quakeData.id}.csv`);
    } else {
      showValidationError('No results to export. Please calculate a forecast first.');
    }
  });
  
  buttonContainer.appendChild(exportButton);
}

/**
 * Set up enhanced print functionality
 */
function setupPrintFunctionality() {
  const printButton = document.getElementById('printButton');
  if (!printButton) return;
  
  printButton.addEventListener('click', () => {
    // Check if we have results to print
    if (!window.lastResults) {
      showValidationError('No forecast results to print. Please calculate a forecast first.');
      return;
    }
    
    // Call the simplified print function
    prepareForPrinting();
  });
}

/**
 * Prepare document for printing
 */
function prepareForPrinting() {
  if (!window.lastResults) {
    showValidationError('No forecast results to print. Please calculate a forecast first.');
    return;
  }
  
  // Add current date to header
  const header = document.querySelector('header');
  header.setAttribute('data-date', new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));
  
  // Create print info section
  const printInfo = document.createElement('div');
  printInfo.id = 'print-info';
  printInfo.style.display = 'none';
  printInfo.innerHTML = `
    <div style="margin: 0.3in 0; font-size: 10pt; color: #666;">
      <p><strong>Forecast Parameters:</strong></p>
      <ul style="list-style-type: none; padding: 0;">
        <li>Quake ID: ${document.getElementById('QuakeID').value}</li>
        <li>Magnitude: ${document.getElementById('magnitude').value}</li>
        <li>Calculation Time: ${new Date().toLocaleString()}</li>
      </ul>
    </div>
  `;
  
  // Insert print info after header
  const header = document.querySelector('header');
  header.parentNode.insertBefore(printInfo, header.nextSibling);
  
  // Add print-specific styles
  const printStyles = document.createElement('style');
  printStyles.id = 'print-styles';
  printStyles.textContent = `
    @media print {
      #print-info {
        display: block !important;
      }
      
      /* Ensure table headers repeat on each page */
      thead {
        display: table-header-group;
      }
      
      /* Add subtle grid lines */
      td, th {
        position: relative;
      }
      
      td::after, th::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 100%;
        background-color: #e0e0e0;
      }
      
      /* Format numbers */
      td:nth-child(2), td:nth-child(4), td:nth-child(6) {
        font-family: "Courier New", monospace;
      }
    }
  `;
  document.head.appendChild(printStyles);
  
  // Print the page
  window.print();
  
  // Clean up
  setTimeout(() => {
    if (printInfo.parentNode) printInfo.parentNode.removeChild(printInfo);
    if (printStyles.parentNode) printStyles.parentNode.removeChild(printStyles);
  }, 1000);
}

/**
 * No reset needed with simpler approach
 */
function resetAfterPrinting() {
  // No DOM changes to reset
  console.log('Print dialog closed');
}

// (This function has been removed as the visualization section is now defined in the HTML)
