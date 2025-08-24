# Media Manipulation Detection Frontend

This is an Express.js frontend for the media manipulation detection service.

## Setup

1. Start the Python backend (Flask API):
   ```bash
   python app/main.py
   ```
   The backend will run on `http://localhost:5000`

2. Start the Express.js frontend:
   ```bash
   node server.js
   ```
   The frontend will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Enter two image URLs:
   - Original Image URL
   - Suspect Image URL
3. Click "Analyze Images"
4. View the analysis results including:
   - Manipulation detection status
   - Similarity score
   - Image dimensions
   - Preview of both images

## API Endpoints

- `GET /` - Main interface
- `POST /api/detect` - Proxy to Python backend for image analysis

## Environment Variables

- `PORT` - Frontend server port (default: 3000)
- `PYTHON_API_URL` - Python backend URL (default: http://localhost:5000)