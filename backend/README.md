# Task Management Backend

FastAPI backend for task management application with PostgreSQL database.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials.

3. Run the server:
```bash
uvicorn src.main:app --reload
```

Server runs on `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
