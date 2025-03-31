# AfterShock Calculator - Agent Guide

## Project Overview
Web-based application for generating aftershock forecasts based on earthquake events. Uses vanilla JavaScript and Bootstrap 5.

## Testing & Development
- To preview the application locally: `python -m http.server 8000`
- No formal testing/linting structure in place

## Code Style Guidelines

### Structure
- Single HTML page (`AfterShock_Beta.html`) with external JS (`aftershock.js`)
- Follow existing modular function approach with clear responsibility separation

### JavaScript Conventions
- Use camelCase for variables and functions
- Prefix DOM element IDs with functional area (e.g., `M1R_d1`)
- Format numeric outputs consistently using helper functions like `formatPercentage()`
- Use descriptive function and variable names
- Include JSDoc style comments for complex calculations

### Error Handling
- Use input validation with helpful alert messages
- Validate numeric inputs for range constraints
- Check for invalid input formats with RegExp

### DOM Manipulation
- Use `getElementById()` for element selection
- Update UI elements with meaningful error messages
- Clear results when inputs change

### API Interaction
- Use XMLHttpRequest for GeoNet API calls
- Handle response state and status appropriately

### Bootstrap Usage
- Use Bootstrap 5 classes for UI components
- Follow existing responsive design patterns