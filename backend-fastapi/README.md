# TRUVEXA AI — FastAPI Backend Microservice

This directory contains the standalone FastAPI backend implementation for TRUVEXA AI.

## Quick Start (Local)

1. Ensure Python 3.11+ is installed.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. View interactive Swagger documentation at: `http://localhost:8000/docs`

## Production Deployment on Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository containing this directory.
3. Configure:
   - **Environment:** Docker (uses included `Dockerfile`) or Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Set Environment Variables:
   - `OPENAI_API_KEY` or `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
