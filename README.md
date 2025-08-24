# Media Manipulation Detection API

A Flask-based backend service that detects media manipulation by comparing original and suspect images or videos using computer vision techniques.

## Features

- REST API endpoint for media manipulation detection
- Support for both images and videos
- Image comparison using SSIM (Structural Similarity Index)
- Video frame extraction and analysis
- Comprehensive error handling and validation
- Docker support for easy deployment

## Getting Started

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

```bash
python app/main.py
```

The API will be available at `http://localhost:5000`

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

```bash
pytest tests/
```
