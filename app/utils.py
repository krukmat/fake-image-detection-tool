"""
Utility functions for media processing and analysis.

This module provides functions for downloading media files, detecting media types,
and extracting frames from videos.
"""

import requests
import numpy as np
from PIL import Image
from io import BytesIO
from typing import List
import logging

logger = logging.getLogger(__name__)

# Supported image MIME types
IMAGE_MIME_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/bmp', 'image/webp', 'image/tiff'
}

# Supported video MIME types
VIDEO_MIME_TYPES = {
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'video/flv', 'video/webm', 'video/mkv'
}

# Request timeout in seconds
REQUEST_TIMEOUT = 30

# Maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024


def download_media(url: str) -> bytes:
    """
    Download media file from URL and return binary data.

    Args:
        url: The URL to download from

    Returns:
        Binary data of the downloaded file

    Raises:
        requests.exceptions.RequestException: If download fails
        ValueError: If URL is invalid or file is too large
        RuntimeError: If content type is unsupported
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string")

    if not url.startswith(('http://', 'https://')):
        raise ValueError("URL must start with http:// or https://")

    try:
        logger.info(f"Downloading media from: {url}")

        # Send HEAD request first to check content type and size
        head_response = requests.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        head_response.raise_for_status()

        content_type = head_response.headers.get('content-type', '').lower()
        content_length = head_response.headers.get('content-length')

        # Check file size
        if content_length and int(content_length) > MAX_FILE_SIZE:
            raise ValueError(f"File too large: {content_length} bytes (max: {MAX_FILE_SIZE})")

        # Check content type
        if not any(mime_type in content_type for mime_type in IMAGE_MIME_TYPES | VIDEO_MIME_TYPES):
            raise RuntimeError(f"Unsupported content type: {content_type}")

        # Download the file
        response = requests.get(url, timeout=REQUEST_TIMEOUT, stream=True)
        response.raise_for_status()

        # Read content with size limit
        content = BytesIO()
        downloaded_size = 0

        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                downloaded_size += len(chunk)
                if downloaded_size > MAX_FILE_SIZE:
                    raise ValueError(f"File too large: exceeds {MAX_FILE_SIZE} bytes")
                content.write(chunk)

        data = content.getvalue()
        logger.info(f"Successfully downloaded {len(data)} bytes")

        return data

    except requests.exceptions.Timeout:
        raise requests.exceptions.RequestException(f"Request timeout after {REQUEST_TIMEOUT} seconds")
    except requests.exceptions.RequestException as e:
        logger.error(f"Download failed for {url}: {str(e)}")
        raise


def is_image(data: bytes) -> bool:
    """
    Check if binary data represents an image.

    Args:
        data: Binary data to check

    Returns:
        True if data is a valid image, False otherwise
    """
    if not data:
        return False

    try:
        with Image.open(BytesIO(data)) as img:
            # Verify the image by attempting to load it
            img.verify()
            return True
    except Exception:
        return False


def is_video(data: bytes) -> bool:
    """
    Check if binary data represents a video.

    Args:
        data: Binary data to check

    Returns:
        True if data is a valid video, False otherwise
    """
    if not data:
        return False

    try:
        # Create temporary file-like object
        # temp_file = BytesIO(data)

        # Try to open with OpenCV
        # Note: OpenCV typically needs a file path, so we'll use a workaround
        # by writing to a temporary location or using magic bytes

        # Check for common video file signatures
        video_signatures = [
            b'\x00\x00\x00\x14ftypmp4',  # MP4
            b'\x00\x00\x00\x20ftypmp4',  # MP4
            b'RIFF',  # AVI
            b'\x1a\x45\xdf\xa3',  # MKV
        ]

        for signature in video_signatures:
            if data.startswith(signature) or signature in data[:100]:
                return True

        # Additional check: try to read first few bytes as video
        return len(data) > 100 and data[4:8] == b'ftyp'

    except Exception:
        return False


def extract_frames(video_data: bytes, fps: float = 1.0) -> List[Image.Image]:
    """
    Extract frames from video data at specified frame rate.

    Args:
        video_data: Binary video data
        fps: Frames per second to extract (default: 1 frame per second)

    Returns:
        List of PIL Image objects

    Raises:
        ValueError: If video data is invalid
        RuntimeError: If frame extraction fails
    """
    if not video_data:
        raise ValueError("Video data cannot be empty")

    if fps <= 0:
        raise ValueError("FPS must be positive")

    try:
        # Write video data to temporary buffer
        # OpenCV requires a file path, so we'll need to work with the data directly
        # For now, we'll implement a basic frame extraction

        # This is a simplified implementation
        # In a production environment, you might want to use temporary files
        # or a more sophisticated video processing library

        frames = []

        # Create a numpy array from bytes
        # video_array = np.frombuffer(video_data, dtype=np.uint8)

        # Try to decode with OpenCV
        # This is a simplified approach - in practice, you'd need to:
        # 1. Save to temp file or use cv2.VideoCapture with buffer
        # 2. Handle different video formats properly

        # For demonstration, return empty list with proper error handling
        logger.warning("Frame extraction not fully implemented - returning empty frame list")

        return frames

    except Exception as e:
        logger.error(f"Frame extraction failed: {str(e)}")
        raise RuntimeError(f"Failed to extract frames: {str(e)}")


def validate_media_data(data: bytes) -> str:
    """
    Validate media data and return media type.

    Args:
        data: Binary media data

    Returns:
        Media type: 'image' or 'video'

    Raises:
        ValueError: If data is invalid or unsupported
    """
    if not data:
        raise ValueError("Media data cannot be empty")

    if is_image(data):
        return 'image'
    elif is_video(data):
        return 'video'
    else:
        raise ValueError("Unsupported media type - must be image or video")


def resize_image_to_match(img1: Image.Image, img2: Image.Image) -> tuple[Image.Image, Image.Image]:
    """
    Resize images to the same dimensions for comparison.

    Args:
        img1: First image
        img2: Second image

    Returns:
        Tuple of resized images with matching dimensions
    """
    # Calculate target size (use the smaller dimensions to avoid upscaling)
    width = min(img1.width, img2.width)
    height = min(img1.height, img2.height)

    target_size = (width, height)

    # Resize both images
    img1_resized = img1.resize(target_size, Image.Resampling.LANCZOS)
    img2_resized = img2.resize(target_size, Image.Resampling.LANCZOS)

    return img1_resized, img2_resized
