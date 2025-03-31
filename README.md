# AfterShock Calculator

A web application to generate aftershock forecasts for earthquake events based on the Modified Omori Law. Originally based on code supplied by Annemarie Christophersen.

## Features

- Fetch earthquake data from the GeoNet API
- Calculate aftershock forecasts using scientifically validated models
- Visualize results with interactive charts
- Export forecast data in CSV format
- Support for custom model parameters

## Running the Application

There are several ways to run the AfterShock Calculator:

### 1. Using Python (Simplest Method)

```bash
# Open terminal in the project root directory
python -m http.server 8000

# Then open your browser and navigate to:
http://localhost:8000/AfterShock_Beta.html
```

### 2. Using NPM

```bash
# Install dependencies first
npm install

# Start the server
npm start

# Then open your browser and navigate to:
http://localhost:8000/AfterShock_Beta.html
```

### 3. Development Setup with VSCode (Recommended)

1. Install the "Live Server" extension:
   - Open VSCode
   - Press Ctrl+Shift+X (or Cmd+Shift+X on Mac)
   - Search for "Live Server"
   - Install "Live Server" by Ritwick Dey

2. Run using Live Server:
   - Right-click on `AfterShock_Beta.html` in VSCode's file explorer
   - Select "Open with Live Server"
   - Your browser will automatically open
   - Changes will automatically reload

### Running Tests

```bash
npm test
```

## Scientific Background

The AfterShock Calculator uses the Modified Omori Law and Gutenberg-Richter relationship to forecast aftershock sequences. It provides:

- Expected number of aftershocks in different magnitude ranges
- Probability of experiencing one or more aftershocks
- Statistical confidence intervals (95%)

## Architecture

The application follows the Model-View-Controller (MVC) pattern:

- **Models**: Scientific calculations and data structures
- **Views**: UI rendering and result display
- **Controllers**: User interaction and application logic
- **Services**: External API interactions
- **Utils**: Common functions and helpers

## Prerequisites

- A modern web browser
- Node.js (for running tests)
- Python (for local development server)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/GNS-Science/aftershock-calculator.git
   cd aftershock-calculator
   ```

2. Start the development server using one of the methods above

## Deployment

The application can be deployed as static files to any web server. Current deployment options:

- Private S3 bucket accessed via CloudFront
- Potential to use Fastly with IP restrictions for GNS Science use only

## License

This project is licensed under the MIT License - see the LICENSE file for details.
