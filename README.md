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
- Real-time image previews
- Loading states and error handling
- Responsive design for mobile and desktop
- Accessibility compliance (ARIA labels, keyboard navigation)
- Form validation

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
