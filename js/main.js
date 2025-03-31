/**
 * Main entry point for the AfterShock calculator application
 */

import { init as initializeController } from './controllers/aftershockController.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing AfterShock calculator');
  
  try {
    // Initialize controller
    initializeController();
    
    // Load Chart.js if not already loaded
    loadChartJs();
    
    console.log('AfterShock calculator initialized successfully');
  } catch (error) {
    console.error('Error initializing AfterShock calculator:', error);
  }
});

// This function has been removed as the visualization container is now defined in the HTML

/**
 * Load Chart.js from CDN if not already loaded
 */
function loadChartJs() {
  if (typeof Chart !== 'undefined') {
    console.log('Chart.js is already loaded');
    return;
  }
  
  console.log('Loading Chart.js from CDN');
  
  // Create a promise to handle script loading
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Chart.js loaded successfully');
      
      // The chart container is already in the HTML
      console.log('Chart.js is ready to use for visualization');
      
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Error loading Chart.js:', error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}