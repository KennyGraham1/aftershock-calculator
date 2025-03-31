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

// Toast notification system
function showToast(title, message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast show`;
  toast.innerHTML = `
    <div class="toast-header bg-${type}">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close" onclick="this.closest('.toast').remove()"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Loading state management
function showLoading() {
  document.querySelector('.loading-spinner').style.display = 'block';
}

function hideLoading() {
  document.querySelector('.loading-spinner').style.display = 'none';
}

// Help guide toggle
function toggleHelp() {
  const guide = document.getElementById('helpGuide');
  guide.style.display = guide.style.display === 'none' ? 'block' : 'none';
}

// Quake search modal
function showQuakeSearch() {
  // Implement a modal dialog for searching earthquakes by date range, location, etc.
}

// Enhanced error handling
window.addEventListener('error', (event) => {
  showToast('Error', 'An unexpected error occurred. Please try again.', 'danger');
  console.error(event.error);
});

// Form validation
function validateInputs() {
  const inputs = document.querySelectorAll('input[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value) {
      input.classList.add('is-invalid');
      isValid = false;
    } else {
      input.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

// Enhanced chart options
function createChart(data) {
  const ctx = document.getElementById('chartContainer').getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Aftershocks'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Days After Mainshock'
          }
        }
      }
    }
  });
}
