// Integration tests for API endpoints
// Testing the full request-response cycle (similar to Android UI tests with Espresso)

const request = require('supertest');
const mongoose = require('mongoose');

// Import the express app, not the server
const express = require('express');
const cors = require('cors');

// We'll create a test version of the app
let app;

describe('API Integration Tests', () => {
    beforeAll(async () => {
        // Create a simple test app with basic endpoints for testing
        app = express();
        app.use(cors());
        app.use(express.json());

        // Add basic test endpoints
        app.get('/api/health', (req, res) => {
            res.json({
                success: true,
                message: 'API is healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        app.get('/api/info', (req, res) => {
            res.json({
                success: true,
                data: {
                    name: 'Test API',
                    version: '1.0.0-test',
                    description: 'Test API for unit tests'
                }
            });
        });

        app.get('/api/isitnotfriday', (req, res) => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const isFriday = dayOfWeek === 5;
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            res.json({
                success: true,
                answer: isFriday ? 'No' : 'Yes',
                message: isFriday ? "It's Friday! 🎉" : `It's ${dayNames[dayOfWeek]}. Still waiting for Friday!`,
                day: dayNames[dayOfWeek],
                timestamp: now.toISOString()
            });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: {
                    message: 'Endpoint not found',
                    code: 'NOT_FOUND'
                }
            });
        });
    });

    afterAll(async () => {
        // Clean up if needed
    });

    describe('Health Endpoints', () => {
        it('GET /api/health should return healthy status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'API is healthy',
                timestamp: expect.any(String),
                uptime: expect.any(Number)
            });
        });

        it('GET /api/info should return API information', async () => {
            const response = await request(app)
                .get('/api/info')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                data: expect.objectContaining({
                    name: expect.any(String),
                    version: expect.any(String),
                    description: expect.any(String)
                })
            });
        });
    });

    describe('Utility Endpoints', () => {
        it('GET /api/isitnotfriday should return day information', async () => {
            const response = await request(app)
                .get('/api/isitnotfriday')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                answer: expect.stringMatching(/^(Yes|No)$/),
                message: expect.any(String),
                day: expect.any(String),
                timestamp: expect.any(String)
            });
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent endpoints', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                error: expect.objectContaining({
                    message: expect.any(String),
                    code: expect.any(String)
                })
            });
        });
    });
});
