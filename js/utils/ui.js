/**
 * UI utility functions
 */

/**
 * Show validation error with visual feedback
 * @param {string} message - Error message to display
 * @param {string} elementId - ID of the element with error (optional)
 */
export function showValidationError(message, elementId = null) {
  // Create or use existing error container
  let errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'alert alert-danger alert-dismissible fade show mt-3';
    errorContainer.setAttribute('role', 'alert');
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    
    errorContainer.appendChild(closeButton);
    
    // Add to document
    const formElement = document.getElementById('Params');
    formElement.prepend(errorContainer);
  }
  
  // Set error message
  errorContainer.textContent = message;
  
  // Highlight specific field if provided
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('is-invalid');
      
      // Add event listener to remove validation styling when user corrects input
      element.addEventListener('input', function() {
        this.classList.remove('is-invalid');
      }, { once: true });
    }
  }
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (errorContainer.parentNode) {
      errorContainer.parentNode.removeChild(errorContainer);
    }
  }, 5000);
}

/**
 * Update UI element with value
 * @param {string} elementId - ID of element to update
 * @param {string} value - Value to set
 */
export function updateElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Reset UI elements for results display
 */
export function clearResults() {
  const elementsToReset = [
    'Range1', 'Range2', 'Range3', 'qID',
    'M1R_d1', 'M2R_d1', 'M3R_d1', 'M1A_d1', 'M2A_d1', 'M3A_d1', 'M1P_d1', 'M2P_d1', 'M3P_d1', 'within_d1',
    'M1R_d2', 'M2R_d2', 'M3R_d2', 'M1A_d2', 'M2A_d2', 'M3A_d2', 'M1P_d2', 'M2P_d2', 'M3P_d2', 'within_d2',
    'M1R_d3', 'M2R_d3', 'M3R_d3', 'M1A_d3', 'M2A_d3', 'M3A_d3', 'M1P_d3', 'M2P_d3', 'M3P_d3', 'within_d3',
  ];
  
  elementsToReset.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id.startsWith('Range')) {
        element.textContent = `Mag range ${id.slice(-1)}`;
      } else if (id.startsWith('within')) {
        element.textContent = 'within nn days';
      } else {
        element.textContent = '';
      }
    }
  });
  
  // Remove any error messages
  const errorContainer = document.getElementById('error-container');
  if (errorContainer && errorContainer.parentNode) {
    errorContainer.parentNode.removeChild(errorContainer);
  }
}

/**
 * Enable or disable model parameters based on model selection
 * @param {string} modelType - The selected model type ('nz', 'sz', or 'cm')
 */
export function setModelParameters(modelType) {
  const parameters = {
    nz: { a: -1.59, b: 1.03, c: 0.04, p: 1.07 },
    sz: { a: -1.97, b: 1.0, c: 0.018, p: 0.92 },
    // Custom parameters are not set automatically
  };
  
  // Get parameter elements
  const aElement = document.getElementById('a');
  const bElement = document.getElementById('b');
  const cElement = document.getElementById('c');
  const pElement = document.getElementById('p');
  
  // Set values and disabled state based on model type
  if (modelType === 'cm') {
    // Enable all fields for custom model
    [aElement, bElement, cElement, pElement].forEach(el => {
      if (el) el.disabled = false;
    });
  } else if (parameters[modelType]) {
    // Set values for predefined model and disable fields
    const { a, b, c, p } = parameters[modelType];
    
    if (aElement) {
      aElement.value = a;
      aElement.disabled = true;
    }
    
    if (bElement) {
      bElement.value = b;
      bElement.disabled = true;
    }
    
    if (cElement) {
      cElement.value = c;
      cElement.disabled = true;
    }
    
    if (pElement) {
      pElement.value = p;
      pElement.disabled = true;
    }
  }
}

/**
 * Enable the calculate button
 */
export function enableCalculateButton() {
  const calculateButton = document.getElementById('doAfters');
  if (calculateButton) {
    calculateButton.disabled = false;
  }
}

/**
 * Disable the calculate button
 */
export function disableCalculateButton() {
  const calculateButton = document.getElementById('doAfters');
  if (calculateButton) {
    calculateButton.disabled = true;
  }
}