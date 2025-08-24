"""
Unit tests for the media manipulation detection API.

This module contains comprehensive tests for all components of the application
including utility functions, image comparison, and the Flask API endpoints.
"""

import pytest
import json
from PIL import Image
from io import BytesIO
from unittest.mock import patch, MagicMock
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from main import app
from comparison import compare_images, detect_manipulation, generate_difference_image
from utils import download_media, is_image, is_video, validate_media_data


class TestImageComparison:
    """Test cases for image comparison functions."""

    def create_test_image(self, size=(100, 100), color=(255, 255, 255)):
        """Create a test PIL image with specified size and color."""
        return Image.new('RGB', size, color)

    def test_compare_identical_images(self):
        """Test comparison of identical images returns score close to 1.0."""
        img1 = self.create_test_image(size=(100, 100), color=(128, 128, 128))
        img2 = self.create_test_image(size=(100, 100), color=(128, 128, 128))

        score = compare_images(img1, img2)

        assert 0.95 <= score <= 1.0, f"Expected similarity score near 1.0, got {score}"

    def test_compare_different_images(self):
        """Test comparison of very different images returns low similarity score."""
        img1 = self.create_test_image(size=(100, 100), color=(0, 0, 0))  # Black
        img2 = self.create_test_image(size=(100, 100), color=(255, 255, 255))  # White

        score = compare_images(img1, img2)

        assert 0.0 <= score <= 0.3, f"Expected low similarity score, got {score}"

    def test_compare_slightly_different_images(self):
        """Test comparison of slightly different images."""
        img1 = self.create_test_image(size=(100, 100), color=(128, 128, 128))
        img2 = self.create_test_image(size=(100, 100), color=(130, 130, 130))

        score = compare_images(img1, img2)

        assert 0.8 <= score <= 1.0, f"Expected high similarity score, got {score}"

    def test_compare_images_invalid_input(self):
        """Test error handling for invalid inputs."""
        img = self.create_test_image()

        with pytest.raises(ValueError):
            compare_images(None, img)

        with pytest.raises(ValueError):
            compare_images(img, "not_an_image")

        with pytest.raises(ValueError):
            compare_images(img, img, threshold=1.5)  # Invalid threshold

    def test_detect_manipulation_identical(self):
        """Test manipulation detection with identical images."""
        img1 = self.create_test_image()
        img2 = self.create_test_image()

        is_manipulated, score, message = detect_manipulation(img1, img2)

        assert not is_manipulated
        assert score >= 0.95
        assert "No manipulation detected" in message

    def test_detect_manipulation_different(self):
        """Test manipulation detection with very different images."""
        img1 = self.create_test_image(color=(0, 0, 0))
        img2 = self.create_test_image(color=(255, 255, 255))

        is_manipulated, score, message = detect_manipulation(img1, img2)

        assert is_manipulated
        assert score < 0.98
        assert "Manipulation detected" in message

    def test_generate_difference_image(self):
        """Test difference image generation."""
        img1 = self.create_test_image(color=(100, 100, 100))
        img2 = self.create_test_image(color=(150, 150, 150))

        diff_img = generate_difference_image(img1, img2)

        assert diff_img is not None
        assert isinstance(diff_img, Image.Image)
        assert diff_img.size == img1.size


class TestUtilityFunctions:
    """Test cases for utility functions."""

    def test_is_image_valid(self):
        """Test image validation with valid image data."""
        # Create a simple PNG image in memory
        img = Image.new('RGB', (10, 10), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')

        assert is_image(img_bytes.getvalue())

    def test_is_image_invalid(self):
        """Test image validation with invalid data."""
        assert not is_image(b"not an image")
        assert not is_image(b"")
        assert not is_image(None)

    def test_is_video_with_signatures(self):
        """Test video validation with known signatures."""
        # MP4 signature
        mp4_data = b'\x00\x00\x00\x14ftypmp41234567890'
        assert is_video(mp4_data)

        # Invalid data
        assert not is_video(b"not a video")
        assert not is_video(b"")

    def test_validate_media_data(self):
        """Test media type validation."""
        # Create test image
        img = Image.new('RGB', (10, 10), color='blue')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')

        media_type = validate_media_data(img_bytes.getvalue())
        assert media_type == 'image'

        # Test invalid data
        with pytest.raises(ValueError):
            validate_media_data(b"invalid data")

    @patch('utils.requests.head')
    @patch('utils.requests.get')
    def test_download_media_success(self, mock_get, mock_head):
        """Test successful media download."""
        # Mock HEAD response
        mock_head_response = MagicMock()
        mock_head_response.headers = {
            'content-type': 'image/jpeg',
            'content-length': '1000'
        }
        mock_head_response.raise_for_status = MagicMock()
        mock_head.return_value = mock_head_response

        # Mock GET response
        test_data = b'fake image data'
        mock_get_response = MagicMock()
        mock_get_response.iter_content.return_value = [test_data]
        mock_get_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_get_response

        result = download_media('https://example.com/image.jpg')

        assert result == test_data
        mock_head.assert_called_once()
        mock_get.assert_called_once()

    def test_download_media_invalid_url(self):
        """Test download with invalid URLs."""
        with pytest.raises(ValueError):
            download_media("")

        with pytest.raises(ValueError):
            download_media("not_a_url")

        with pytest.raises(ValueError):
            download_media("ftp://example.com/file.jpg")


class TestFlaskAPI:
    """Test cases for Flask API endpoints."""

    @pytest.fixture
    def client(self):
        """Create a test client for the Flask application."""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    def test_health_endpoint(self, client):
        """Test the health check endpoint."""
        response = client.get('/health')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'

    def test_detect_endpoint_missing_json(self, client):
        """Test /detect endpoint with missing JSON content."""
        response = client.post('/detect', data='not json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Content-Type must be application/json' in data['error']

    def test_detect_endpoint_missing_fields(self, client):
        """Test /detect endpoint with missing required fields."""
        response = client.post('/detect',
                             json={'url_original': 'https://example.com/img1.jpg'})

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'required' in data['error']

    def test_detect_endpoint_empty_urls(self, client):
        """Test /detect endpoint with empty URLs."""
        response = client.post('/detect',
                             json={
                                 'url_original': '',
                                 'url_suspect': 'https://example.com/img2.jpg'
                             })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'cannot be empty' in data['error']

    def test_detect_endpoint_invalid_url_type(self, client):
        """Test /detect endpoint with non-string URLs."""
        response = client.post('/detect',
                             json={
                                 'url_original': 123,
                                 'url_suspect': 'https://example.com/img2.jpg'
                             })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'must be strings' in data['error']

    @patch('main.download_media')
    def test_detect_endpoint_download_failure(self, mock_download, client):
        """Test /detect endpoint with download failure."""
        mock_download.side_effect = Exception("Download failed")

        response = client.post('/detect',
                             json={
                                 'url_original': 'https://example.com/img1.jpg',
                                 'url_suspect': 'https://example.com/img2.jpg'
                             })

        assert response.status_code == 500

    @patch('main.download_media')
    @patch('main.validate_media_data')
    @patch('main.Image.open')
    @patch('main.detect_image_manipulation')
    def test_detect_endpoint_success(self, mock_detect, mock_image_open,
                                   mock_validate, mock_download, client):
        """Test successful detection request."""
        # Mock download
        mock_download.return_value = b'fake image data'

        # Mock validation
        mock_validate.return_value = 'image'

        # Mock PIL Image
        mock_img = MagicMock()
        mock_img.size = (100, 100)
        mock_image_open.return_value = mock_img

        # Mock detection result
        mock_detect.return_value = (True, 0.85, "Manipulation detected")

        response = client.post('/detect',
                             json={
                                 'url_original': 'https://example.com/img1.jpg',
                                 'url_suspect': 'https://example.com/img2.jpg'
                             })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['manipulated'] is True
        assert data['score'] == 0.85
        assert 'Manipulation detected' in data['message']
        assert data['media_type'] == 'image'

    def test_not_found_endpoint(self, client):
        """Test 404 error handling."""
        response = client.get('/nonexistent')

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'not found' in data['error'].lower()

    def test_method_not_allowed(self, client):
        """Test 405 error handling."""
        response = client.get('/detect')  # Should be POST

        assert response.status_code == 405
        data = json.loads(response.data)
        assert 'not allowed' in data['error'].lower()


if __name__ == '__main__':
    pytest.main([__file__])
