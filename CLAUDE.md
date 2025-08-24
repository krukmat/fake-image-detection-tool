You are Claude Code. Please generate the following step by step, following clean code practices, PEP8, docstrings, and type hints.  

## Step 1 – Project Setup
- Create a base project structure for a Python backend service:
  - Root files: `README.md`, `.gitignore`, `requirements.txt`
  - Folder: `app/` (for source code)
  - Folder: `tests/` (for unit tests)
- `.gitignore` must exclude: venv, `__pycache__`, `.DS_Store`, build artifacts.
- `README.md` should contain a short description of the project.

## Step 2 – Dependencies
- Generate a `requirements.txt` file including:
  flask
  requests
  opencv-python
  scikit-image
  pillow
  pytest

## Step 3 – Dockerfile
- Create a `Dockerfile`:
  - Base image: python:3.11-slim
  - Copy project files
  - Install dependencies from `requirements.txt`
  - Expose port 5000
  - Run the Flask app as entrypoint
- Keep it minimal, readable, and production-ready.

## Step 4 – Flask API Skeleton
- In `app/main.py`:
  - Initialize a Flask app
  - Define a POST endpoint `/detect` that accepts JSON with:
    { "url_original": str, "url_suspect": str }
  - Return a placeholder JSON response
- Add docstrings, inline comments, and type hints.
- Ensure modularity and clean structure.

## Step 5 – Media Download Utility
- In `app/utils.py`, implement `download_media(url: str) -> bytes`:
  - Use `requests` to fetch the file
  - Handle errors: timeouts, invalid responses, unsupported content types
  - Return binary data if successful
  - Raise descriptive exceptions otherwise
- Add docstrings and type hints.

## Step 6 – Media Type Detection & Frame Extraction
- In `app/utils.py` also implement:
  - `is_image(data: bytes) -> bool`
  - `is_video(data: bytes) -> bool`
  - `extract_frames(video_data: bytes) -> List[Image]`
- Use OpenCV to extract 1 frame per second.
- Add docstrings, type hints, and error handling.

## Step 7 – Image Comparison
- In `app/comparison.py`, implement `compare_images(img1, img2) -> float`:
  - Use SSIM (Structural Similarity Index) from scikit-image
  - Normalize images to same size before comparing
  - Return similarity score (0 to 1)
  - Add a threshold for manipulation (e.g., <0.98)
  - Optional: generate diff image for debugging
- Ensure modular, documented, testable code.

## Step 8 – Full Endpoint Logic
- Update `/detect` in `app/main.py`:
  - Download both URLs
  - Detect type (image vs video)
  - If images: compare directly
  - If videos: extract frames and compare frame-by-frame
  - Return JSON: { "manipulated": bool, "score": float, "message": str }
  - Handle errors gracefully and return appropriate HTTP codes:
    - 200 success
    - 400 invalid input
    - 500 internal error

## Step 9 – Tests
- In `tests/test_app.py`:
  - Unit tests for `compare_images()` (identical, slightly different, very different)
  - Integration test for `/detect` using Flask test client
  - Ensure test names are descriptive and assertions clear

## Step 10 – Code Quality Pass
- Review all generated code:
  - Add docstrings everywhere
  - Use consistent type hints
  - Ensure PEP8 compliance
  - Keep modular structure
  - Add comments where logic is non-trivial

- always a new feature is added it should run all tests frontend and backend. add the details in the readme and commit and push