"""
Flask API for media manipulation detection.

This module provides a REST API endpoint to detect manipulation in media files
by comparing original and suspect images or videos using computer vision techniques.
"""

from flask import Flask, request, jsonify
from typing import Dict, Any
import logging
from PIL import Image
from io import BytesIO
import requests.exceptions

from utils import download_media, validate_media_data
from comparison import detect_manipulation as detect_image_manipulation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)


@app.route('/detect', methods=['POST'])
def detect_manipulation() -> Dict[str, Any]:
    """
    Detect manipulation between two media files.

    Expected JSON payload:
    {
        "url_original": "https://example.com/original.jpg",
        "url_suspect": "https://example.com/suspect.jpg"
    }

    Returns:
        JSON response with manipulation detection results:
        {
            "manipulated": bool,
            "score": float,
            "message": str
        }
    """
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                "error": "Content-Type must be application/json"
            }), 400

        data = request.get_json()

        # Validate required fields
        if not data or 'url_original' not in data or 'url_suspect' not in data:
            return jsonify({
                "error": "Both 'url_original' and 'url_suspect' are required"
            }), 400

        url_original = data.get('url_original')
        url_suspect = data.get('url_suspect')

        # Validate URLs are strings
        if not isinstance(url_original, str) or not isinstance(url_suspect, str):
            return jsonify({
                "error": "URLs must be strings"
            }), 400

        # Validate URLs are not empty
        if not url_original.strip() or not url_suspect.strip():
            return jsonify({
                "error": "URLs cannot be empty"
            }), 400

        logger.info(f"Processing detection request: {url_original} vs {url_suspect}")

        # Download both media files
        try:
            original_data = download_media(url_original)
            suspect_data = download_media(url_suspect)
        except requests.exceptions.RequestException as e:
            return jsonify({
                "error": f"Failed to download media: {str(e)}"
            }), 400
        except ValueError as e:
            return jsonify({
                "error": f"Invalid media: {str(e)}"
            }), 400

        # Validate media types
        try:
            original_type = validate_media_data(original_data)
            suspect_type = validate_media_data(suspect_data)
        except ValueError as e:
            return jsonify({
                "error": f"Unsupported media type: {str(e)}"
            }), 400

        # Ensure both files are the same type for now (image comparison only)
        if original_type != suspect_type:
            return jsonify({
                "error": "Both files must be the same media type (image or video)"
            }), 400

        # Currently only support image comparison
        if original_type != 'image':
            return jsonify({
                "error": "Video comparison not yet implemented. Please use images."
            }), 400

        # Process images
        try:
            # Convert binary data to PIL Images
            original_image = Image.open(BytesIO(original_data))
            suspect_image = Image.open(BytesIO(suspect_data))

            # Perform manipulation detection
            is_manipulated, similarity_score, message = detect_image_manipulation(
                original_image, suspect_image
            )

            response = {
                "manipulated": is_manipulated,
                "score": round(similarity_score, 4),
                "message": message,
                "media_type": original_type,
                "original_dimensions": original_image.size,
                "suspect_dimensions": suspect_image.size
            }

            logger.info(f"Detection completed: {response}")
            return jsonify(response), 200

        except Exception as e:
            logger.error(f"Image processing error: {str(e)}")
            return jsonify({
                "error": f"Image processing failed: {str(e)}"
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error in detect_manipulation: {str(e)}")
        return jsonify({
            "error": "Internal server error"
        }), 500


@app.route('/health', methods=['GET'])
def health_check() -> Dict[str, str]:
    """
    Health check endpoint.

    Returns:
        JSON response indicating service health.
    """
    return jsonify({"status": "healthy"}), 200


@app.errorhandler(404)
def not_found(error) -> Dict[str, str]:
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error) -> Dict[str, str]:
    """Handle 405 errors."""
    return jsonify({"error": "Method not allowed"}), 405


if __name__ == '__main__':
    logger.info("Starting Media Manipulation Detection API")
    app.run(host='0.0.0.0', port=5000, debug=False)
