# AI Chat Backend

## Overview
A Flask-based backend API server that provides a simulated AI chat interface. The backend exposes REST endpoints for health checking and chat functionality.

## Project Structure
- `app.py` - Main Flask application with API endpoints
- `requirements.txt` - Python dependencies
- `Procfile` - Heroku/production deployment configuration
- `runtime.txt` - Python version specification

## API Endpoints

### Health Check
- **GET** `/health` - Returns server health status

### Chat
- **POST** `/chat` - Accepts JSON with `message` field, returns simulated AI response

## Running the Application
The Flask development server runs on port 5000 with debug mode enabled.

## Dependencies
- Flask 3.0.0
- Gunicorn 21.2.0
- python-dotenv 1.0.0

## Deployment
Uses Gunicorn as the production WSGI server.
