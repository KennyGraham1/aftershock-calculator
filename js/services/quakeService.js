/**
 * Service for interacting with the GeoNet earthquake API
 */

/**
 * Fetch quake data from the GeoNet API
 * @param {string} quakeId - The ID of the quake to fetch
 * @returns {Promise<Object>} - Promise that resolves to the quake data
 * @throws {Error} If the quake is not found or there's a network error
 */
export async function fetchQuakeData(quakeId) {
  try {
    const quakeUrl = `https://api.geonet.org.nz/quake/${quakeId}`;
    const response = await fetch(quakeUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Quake not found');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response has the expected structure
    if (!data.features || !data.features[0] || !data.features[0].properties) {
      throw new Error('Invalid response format from API');
    }
    
    const properties = data.features[0].properties;
    
    // Validate required fields exist
    if (!properties.magnitude || !properties.time) {
      throw new Error('Incomplete quake data received');
    }
    
    // Convert time to consistent ISO format if needed
    let quakeTime = properties.time;
    if (typeof quakeTime === 'string' && !quakeTime.includes('T')) {
      // If time doesn't have a 'T' separator, try to parse it as a different format
      try {
        const parsedDate = new Date(quakeTime);
        quakeTime = parsedDate.toISOString();
      } catch (error) {
        console.warn('Could not parse time string:', quakeTime);
      }
    }
    
    return {
      id: quakeId,
      magnitude: properties.magnitude,
      time: quakeTime,
      // Add more fields as needed
      depth: properties.depth,
      location: properties.locality || 'Unknown',
    };
  } catch (error) {
    console.error('Error fetching quake data:', error);
    throw error;
  }
}

/**
 * Calculate default magnitude thresholds based on the main quake magnitude
 * @param {number} magnitude - The magnitude of the main quake
 * @returns {Object} Object containing m1, m2, and m3 magnitude thresholds
 */
export function calculateMagnitudeThresholds(magnitude) {
  // Using standard half-unit intervals instead of rounding
  const m1 = Math.floor(magnitude * 2) / 2;
  const m2 = m1 > 1 ? m1 - 1 : 1;
  const m3 = m1 > 2 ? m1 - 2 : 1;
  
  return { m1, m2, m3 };
}

/**
 * Export quake data to CSV format
 * @param {Object} quakeData - The quake data
 * @param {Array} forecastResults - The forecast results
 * @returns {string} CSV data as a string
 */
export function exportToCSV(quakeData, forecastResults) {
  const { id, magnitude, time } = quakeData;
  const rows = [
    ['Quake ID', 'Magnitude', 'Time', 'Calculation Time'],
    [id, magnitude, time, new Date().toISOString()],
    [],
    ['Duration', 'Magnitude Range', 'Average Number', 'Range', 'Probability of 1 or more']
  ];
  
  // Add result rows
  forecastResults.forEach(result => {
    const { duration, magnitudeRange, averageNumber, range, probability } = result;
    rows.push([duration, magnitudeRange, averageNumber, range, probability]);
  });
  
  // Convert to CSV
  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Save data as CSV file for download
 * @param {string} csvData - The CSV data to save
 * @param {string} fileName - The name of the file to save
 */
export function downloadCSV(csvData, fileName) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}