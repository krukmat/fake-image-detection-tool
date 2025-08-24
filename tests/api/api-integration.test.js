const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Import our server (but don't start it)
const path = require('path');
const serverPath = path.join(__dirname, '../../server.js');

// Mock axios for backend communication tests
jest.mock('axios');
const mockedAxios = axios;

describe('Express API Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Create a fresh instance of the app for each test
    delete require.cache[serverPath];
    app = require('../../server.js');
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    if (app && app.close) {
      app.close();
    }
  });

  describe('GET /', () => {
    test('should serve the main HTML page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('Media Manipulation Detection');
      expect(response.text).toContain('form id="detectionForm"');
    });
  });

  describe('POST /api/detect', () => {
    test('should return 400 for missing URLs', async () => {
      const response = await request(app)
        .post('/api/detect')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    test('should return 400 for missing original URL', async () => {
      const response = await request(app)
        .post('/api/detect')
        .send({ url_suspect: 'https://example.com/image.jpg' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    test('should return 400 for missing suspect URL', async () => {
      const response = await request(app)
        .post('/api/detect')
        .send({ url_original: 'https://example.com/image.jpg' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    test('should forward request to Python backend successfully', async () => {
      const mockResponse = {
        data: {
          manipulated: false,
          score: 0.98,
          message: 'Images are very similar',
          media_type: 'image',
          original_dimensions: [800, 600],
          suspect_dimensions: [800, 600]
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/suspect.jpg'
        })
        .expect(200);

      expect(response.body).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/detect',
        {
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/suspect.jpg'
        }
      );
    });

    test('should handle Python backend errors properly', async () => {
      const backendError = {
        response: {
          status: 400,
          data: { error: 'Invalid image format' }
        }
      };

      mockedAxios.post.mockRejectedValue(backendError);

      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/suspect.jpg'
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid image format' });
    });

    test('should handle network errors to backend', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {};

      mockedAxios.post.mockRejectedValue(networkError);

      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/suspect.jpg'
        })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Cannot connect to detection service'
      });
    });

    test('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockedAxios.post.mockRejectedValue(unexpectedError);

      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/suspect.jpg'
        })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });

    test('should handle manipulation detected response', async () => {
      const mockResponse = {
        data: {
          manipulated: true,
          score: 0.75,
          message: 'Significant differences detected, potential manipulation',
          media_type: 'image',
          original_dimensions: [1920, 1080],
          suspect_dimensions: [1920, 1080]
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 'https://example.com/original.jpg',
          url_suspect: 'https://example.com/manipulated.jpg'
        })
        .expect(200);

      expect(response.body).toEqual(mockResponse.data);
      expect(response.body.manipulated).toBe(true);
      expect(response.body.score).toBe(0.75);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/detect')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('should handle non-string URLs', async () => {
      const response = await request(app)
        .post('/api/detect')
        .send({
          url_original: 123,
          url_suspect: 456
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be strings');
    });
  });
});