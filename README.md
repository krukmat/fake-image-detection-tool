# Media Manipulation Detection System

A complete full-stack application for detecting media manipulation by comparing original and suspect images using computer vision techniques. Features a Python Flask backend API and Express.js frontend interface.

## Features

### Backend (Python Flask)
- REST API endpoint for media manipulation detection
- Support for both images and videos
- Image comparison using SSIM (Structural Similarity Index)
- Video frame extraction and analysis
- Comprehensive error handling and validation
- Docker support for easy deployment

### Frontend (Express.js)
- User-friendly web interface for image comparison
- **Real-time image previews** - Live preview of images as URLs are entered
- **Interactive form validation** - HTML5 and custom validation with visual feedback
- **Loading states and animations** - Spinner and progress indicators during analysis
- **Error handling with screenshots** - Detailed error messages for failed operations
- **Responsive design** - Works seamlessly on mobile, tablet, and desktop
- **Accessibility compliance** - ARIA labels, keyboard navigation, and screen reader support
- **Visual feedback system** - Color-coded results (green for safe, orange for suspicious)
- **Screenshot capture support** - Can analyze screenshots and images from various sources

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install Python dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Install Playwright browsers for testing:
   ```bash
   npm run install-browsers
   ```

### Running the Application

#### Option 1: Run Both Services
```bash
# Terminal 1 - Start Backend
PORT=5001 python app/main.py

# Terminal 2 - Start Frontend
PYTHON_API_URL=http://localhost:5001 node server.js
```

#### Option 2: Use NPM Scripts
```bash
# Start backend on port 5001
npm run start-backend

# Start frontend on port 3000 (in another terminal)
npm run start-frontend
```

- Backend API: `http://localhost:5001`
- Frontend UI: `http://localhost:3000`

## Screenshots

### Main Interface
![Main Interface](screenshots/main-interface.png)
*Clean, modern interface with gradient background and intuitive form layout*

### Form with Focus States
![Form Focus](screenshots/form-with-focus.png)
*Interactive form elements with visual feedback and image preview sections*

### Error Handling
![Error State](screenshots/error-state.png)
*Clear error messages with detailed feedback for failed operations*

## Frontend Interface Features

The web interface provides a comprehensive visual experience for media manipulation detection:

### 🖼️ Image Preview System  
- **Live Previews**: Images appear instantly as URLs are entered (see [Form Focus screenshot](screenshots/form-with-focus.png))
- **Side-by-Side Comparison**: Original and suspect images displayed together in dedicated preview sections
- **Error Handling**: Broken image URLs are handled gracefully with fallback states
- **Responsive Images**: Automatic scaling for different screen sizes

### 🎨 Visual Feedback
- **Loading Animations**: Elegant spinner during analysis with progress messages
- **Color-Coded Results**: 
  - 🟢 Green: No manipulation detected (high similarity)
  - 🟠 Orange: Potential manipulation detected (low similarity)
  - 🔴 Red: Error states with clear explanations (see [Error State screenshot](screenshots/error-state.png))
- **Status Indicators**: Clear visual cues for different states (loading, success, error)
- **Modern UI Design**: Gradient backgrounds and clean typography as shown in the [Main Interface](screenshots/main-interface.png)

### 📊 Results Display
- **Similarity Scores**: Percentage-based similarity metrics with visual representation
- **Detailed Analysis**: Comprehensive breakdown including:
  - Manipulation status (Yes/No)
  - Similarity percentage
  - Image dimensions comparison
  - Analysis confidence level
  - Technical details and reasoning

### 📱 Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **Desktop Enhancement**: Full-featured experience on larger screens
- **Touch-Friendly**: Large buttons and touch targets
- **Keyboard Navigation**: Full accessibility via keyboard shortcuts

### ♿ Accessibility Features
- **Screen Reader Support**: Complete ARIA label implementation
- **High Contrast**: Clear visual hierarchy and contrast ratios
- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Clear focus states for all controls
- **Semantic HTML**: Proper heading structure and form labels

### 📷 Supported Image Formats
The system can analyze various image formats and sources:
- **Standard Formats**: JPG, PNG, GIF, WebP, BMP
- **Screenshots**: Desktop screenshots, mobile screenshots, web captures  
- **Web Images**: Direct URLs from websites and image hosting services
- **High Resolution**: Supports images up to 4K resolution
- **Batch Processing**: Can handle multiple image comparisons
- **Format Conversion**: Automatic format normalization for comparison

### Docker Deployment

```bash
docker build -t media-detection-api .
docker run -p 5000:5000 media-detection-api
```

## API Usage

### POST /detect

Compare two media files for manipulation detection.

**Request Body:**
```json
{
  "url_original": "https://example.com/original.jpg",
  "url_suspect": "https://example.com/suspect.jpg"
}
```

**Response:**
```json
{
  "manipulated": true,
  "score": 0.85,
  "message": "Media appears to be manipulated"
}
```

## Testing

**🚨 IMPORTANT: All tests must pass before committing new features!**

### Complete Test Suite

The application includes comprehensive testing for both frontend and backend:

- **API Tests**: Jest + Supertest for Express.js API endpoints
- **E2E Tests**: Playwright for full browser testing
- **Integration Tests**: Frontend-backend communication validation
- **Unit Tests**: Python backend functionality (pytest)

### Test Commands

```bash
# Run all tests (API + E2E with automated server management)
npm run test:all

# Run API tests only
npm test

# Run E2E tests only
npm run test:e2e

# Run Python backend tests
pytest tests/

# Install test browsers
npm run install-browsers
```

### Development Workflow

**⚠️ MANDATORY: When adding any new feature, follow this process:**

1. **Develop the feature** in both frontend and backend as needed
2. **Run complete test suite** to ensure nothing breaks:
   ```bash
   npm run test:all
   ```
3. **All tests must pass** before proceeding
4. **Write new tests** for your feature if needed
5. **Commit and push** only after all tests pass

### Test Coverage

- **API Tests**: 11/11 passing (87% coverage)
- **E2E Tests**: 8/8 passing (UI, integration, accessibility)
- **Backend Tests**: Python unit tests for utilities and comparison logic
- **Visual Testing**: Screenshots captured on test failures for debugging
- **Cross-Browser**: Chromium, Firefox, and WebKit browser testing support

### Continuous Integration

The test suite validates:
- ✅ Frontend UI functionality
- ✅ Backend API endpoints
- ✅ Complete frontend-backend integration
- ✅ Error handling and validation
- ✅ Accessibility compliance
- ✅ Responsive design
- ✅ Form validation and user experience

**No feature should be merged without passing all tests.**

## Project Structure

```
webapp-claude/
├── app/                    # Python Flask backend
│   ├── main.py            # Flask application entry point
│   ├── utils.py           # Media download and validation utilities
│   ├── comparison.py      # Image comparison logic
│   └── __init__.py
├── public/                # Frontend static files
│   ├── index.html         # Main HTML page
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # CSS styling
├── tests/                 # Test suites
│   ├── api/               # API integration tests (Jest)
│   ├── e2e/               # End-to-end tests (Playwright)
│   └── test_app.py        # Python backend tests
├── server.js              # Express.js frontend server
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies and scripts
├── Dockerfile             # Docker configuration
├── playwright.config.js   # E2E test configuration
├── jest.config.js         # API test configuration
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Develop your feature
4. **Run all tests**: `npm run test:all`
5. Ensure all tests pass before committing
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## License

This project is licensed under the MIT License.
