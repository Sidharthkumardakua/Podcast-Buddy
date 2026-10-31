# Podcast Buddy AI

Podcast Buddy AI turns news articles into podcast-ready summaries, scripts, and audio. Users can browse news, generate summaries and podcasts, and manage their accounts and preferences through a web interface.

## What it does

- Fetches news articles and extracts and cleans article text.
- Summarizes articles with a locally stored BART model.
- Creates podcast scripts from selected news and summaries.
- Generates podcast audio using Coqui TTS in a separate environment.
- Provides account authentication, podcast history, and user settings.
- Fetches news on a schedule.

## Technology

- **Frontend:** React, TypeScript, Vite, Axios, and React Router.
- **Backend:** Python and Flask, with Flask-SQLAlchemy and SQLAlchemy.
- **Database:** PostgreSQL, accessed through Psycopg.
- **Authentication and scheduling:** Flask-JWT-Extended and APScheduler.
- **News processing:** SerpAPI, Requests, Feedparser, Newspaper4k, Trafilatura, Beautiful Soup, and related extraction and parsing libraries.
- **Summarization:** PyTorch and Hugging Face Transformers using a local BART model.
- **Podcast audio:** Coqui TTS, run separately from the main backend environment.

## Project structure

- `backend/` — Flask API, database models, news processing, summarization, and podcast generation.
- `backend/ai/` — BART model and text preprocessing components used by the backend.
- `backend/api/` — API endpoints for authentication, news, summaries, podcasts, and settings.
- `backend/database/` — SQLAlchemy database setup and models.
- `backend/news/` — News retrieval, article extraction, cleaning, and deduplication.
- `backend/podcast/` — Podcast script generation and the separate TTS worker.
- `frontend/` — React and TypeScript user interface.
