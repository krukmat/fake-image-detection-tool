"""
Image comparison module using SSIM (Structural Similarity Index).

This module provides functions to compare images and detect potential manipulation
using structural similarity analysis.
"""

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

# Default threshold for manipulation detection
DEFAULT_MANIPULATION_THRESHOLD = 0.98

# Minimum image dimensions for reliable comparison
MIN_IMAGE_SIZE = (32, 32)


def compare_images(img1: Image.Image, img2: Image.Image,
                  threshold: float = DEFAULT_MANIPULATION_THRESHOLD) -> float:
    """
    Compare two images using SSIM (Structural Similarity Index).

    Args:
        img1: First image (PIL Image)
        img2: Second image (PIL Image)
        threshold: Similarity threshold below which images are considered manipulated

    Returns:
        Similarity score between 0 and 1 (1 = identical, 0 = completely different)

    Raises:
        ValueError: If images are invalid or too small
        RuntimeError: If comparison fails
    """
    if not isinstance(img1, Image.Image) or not isinstance(img2, Image.Image):
        raise ValueError("Both inputs must be PIL Image objects")

    if threshold < 0 or threshold > 1:
        raise ValueError("Threshold must be between 0 and 1")

    try:
        # Convert images to RGB if they aren't already
        if img1.mode != 'RGB':
            img1 = img1.convert('RGB')
        if img2.mode != 'RGB':
            img2 = img2.convert('RGB')

        # Check minimum size requirements
        if img1.size[0] < MIN_IMAGE_SIZE[0] or img1.size[1] < MIN_IMAGE_SIZE[1]:
            raise ValueError(f"First image too small: {img1.size}, minimum: {MIN_IMAGE_SIZE}")
        if img2.size[0] < MIN_IMAGE_SIZE[0] or img2.size[1] < MIN_IMAGE_SIZE[1]:
            raise ValueError(f"Second image too small: {img2.size}, minimum: {MIN_IMAGE_SIZE}")

        # Resize images to match dimensions
        target_size = (min(img1.width, img2.width), min(img1.height, img2.height))

        # Ensure target size meets minimum requirements
        if target_size[0] < MIN_IMAGE_SIZE[0] or target_size[1] < MIN_IMAGE_SIZE[1]:
            raise ValueError(f"Images too small after resizing: {target_size}")

        img1_resized = img1.resize(target_size, Image.Resampling.LANCZOS)
        img2_resized = img2.resize(target_size, Image.Resampling.LANCZOS)

        # Convert PIL images to numpy arrays
        array1 = np.array(img1_resized)
        array2 = np.array(img2_resized)

        # Convert to grayscale for SSIM calculation
        if len(array1.shape) == 3:
            array1_gray = np.dot(array1[..., :3], [0.2989, 0.5870, 0.1140])
        else:
            array1_gray = array1

        if len(array2.shape) == 3:
            array2_gray = np.dot(array2[..., :3], [0.2989, 0.5870, 0.1140])
        else:
            array2_gray = array2

        # Calculate SSIM
        similarity_score = ssim(array1_gray, array2_gray, data_range=255.0)

        # Ensure score is within valid range
        similarity_score = max(0.0, min(1.0, similarity_score))

        logger.info(f"SSIM similarity score: {similarity_score:.4f}")

        return similarity_score

    except Exception as e:
        logger.error(f"Image comparison failed: {str(e)}")
        raise RuntimeError(f"Failed to compare images: {str(e)}")


def detect_manipulation(img1: Image.Image, img2: Image.Image,
                       threshold: float = DEFAULT_MANIPULATION_THRESHOLD) -> Tuple[bool, float, str]:
    """
    Detect if images show signs of manipulation based on similarity analysis.

    Args:
        img1: Original image (PIL Image)
        img2: Suspect image (PIL Image)
        threshold: Similarity threshold below which images are considered manipulated

    Returns:
        Tuple containing:
        - bool: True if manipulation detected, False otherwise
        - float: Similarity score (0-1)
        - str: Descriptive message about the result

    Raises:
        ValueError: If images are invalid
        RuntimeError: If analysis fails
    """
    try:
        similarity_score = compare_images(img1, img2, threshold)

        is_manipulated = similarity_score < threshold

        if is_manipulated:
            confidence = (threshold - similarity_score) / threshold * 100
            message = f"Manipulation detected (confidence: {confidence:.1f}%)"
        else:
            confidence = similarity_score * 100
            message = f"No manipulation detected (similarity: {confidence:.1f}%)"

        logger.info(f"Detection result: manipulated={is_manipulated}, score={similarity_score:.4f}")

        return is_manipulated, similarity_score, message

    except Exception as e:
        logger.error(f"Manipulation detection failed: {str(e)}")
        raise


def generate_difference_image(img1: Image.Image, img2: Image.Image) -> Optional[Image.Image]:
    """
    Generate a difference image highlighting changes between two images.

    Args:
        img1: First image (PIL Image)
        img2: Second image (PIL Image)

    Returns:
        PIL Image showing differences, or None if generation fails
    """
    try:
        # Convert images to RGB
        if img1.mode != 'RGB':
            img1 = img1.convert('RGB')
        if img2.mode != 'RGB':
            img2 = img2.convert('RGB')

        # Resize to match dimensions
        target_size = (min(img1.width, img2.width), min(img1.height, img2.height))
        img1_resized = img1.resize(target_size, Image.Resampling.LANCZOS)
        img2_resized = img2.resize(target_size, Image.Resampling.LANCZOS)

        # Convert to numpy arrays
        array1 = np.array(img1_resized).astype(np.float32)
        array2 = np.array(img2_resized).astype(np.float32)

        # Calculate absolute difference
        diff_array = np.abs(array1 - array2)

        # Enhance differences (multiply by factor for visibility)
        diff_array = np.clip(diff_array * 3, 0, 255)

        # Convert back to PIL Image
        diff_image = Image.fromarray(diff_array.astype(np.uint8))

        logger.info(f"Generated difference image with dimensions: {diff_image.size}")

        return diff_image

    except Exception as e:
        logger.error(f"Difference image generation failed: {str(e)}")
        return None


def analyze_image_properties(img: Image.Image) -> dict:
    """
    Analyze basic properties of an image for forensic analysis.

    Args:
        img: PIL Image to analyze

    Returns:
        Dictionary containing image properties
    """
    try:
        properties = {
            'dimensions': img.size,
            'mode': img.mode,
            'format': img.format,
            'has_exif': bool(img.getexif()) if hasattr(img, 'getexif') else False,
        }

        # Calculate basic statistics
        if img.mode in ['RGB', 'L']:
            array = np.array(img)
            properties.update({
                'mean_intensity': float(np.mean(array)),
                'std_intensity': float(np.std(array)),
                'min_intensity': int(np.min(array)),
                'max_intensity': int(np.max(array))
            })

        return properties

    except Exception as e:
        logger.error(f"Image property analysis failed: {str(e)}")
        return {'error': str(e)}
