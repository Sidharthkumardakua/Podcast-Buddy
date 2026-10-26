# Podcast Buddy AI

Podcast Buddy AI is a Flask and React application that fetches news, summarizes articles with a local BART model, generates a conversational podcast script, and creates WAV audio with text-to-speech.

## Project Structure

- `backend/`: Flask API, database models, news ingestion, summarization, and podcast generation
- `frontend/`: React, TypeScript, and Vite user interface
- `backend/models/`: local trained model files; ignored by Git
- `backend/storage/audio/`: generated podcast audio; ignored by Git

## Requirements

- Python 3.11 or newer
- Node.js and npm
- A SerpAPI key for live news fetching
- A local BART model compatible with the configured model path
- A working Coqui TTS installation for podcast audio generation

## Backend Setup

From the repository root on Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

```env
SECRET_KEY=replace-with-a-long-random-value
JWT_SECRET_KEY=replace-with-another-long-random-value
SERPAPI_KEY=your-serpapi-key
BART_MODEL_PATH=models/news_bart_500
```

The configured BART model directory must exist under `backend/`, unless an absolute path is provided. Model files are intentionally excluded from Git because they are large. Place the model files on the machine separately before starting the API.

Start the backend from the `backend` directory:

```powershell
python app.py
```

The API runs at `http://localhost:5000`.

> The current backend starts an initial news fetch and an hourly scheduler during application startup. This requires a valid `SERPAPI_KEY` and network access.

## Frontend Setup

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and expects the backend at `http://localhost:5000`.

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

## Authentication

Register and log in through the frontend. Protected API requests use the JWT access token stored by the frontend. Do not commit `.env` files or real credentials.

## Podcast Audio

Podcast generation invokes `backend/podcast/tts_worker.py` through the Python interpreter at:

```text
backend/tts_env/Scripts/python.exe
```

The TTS environment is local and ignored by Git. Configure or recreate it separately on each development machine. Generated scripts and WAV files are written to `backend/storage/audio/`.

## GitHub Notes

The repository ignores local secrets, virtual environments, frontend dependencies, build output, trained model files, generated audio, databases, logs, and caches. Commit source code, configuration examples, dependency lock files, and documentation, but never commit:

- `backend/.env`
- `backend/.venv/`, `backend/venv/`, or `backend/tts_env/`
- `frontend/node_modules/` or `frontend/dist/`
- `backend/models/`
- generated audio files
- local database files

## Current Limitations

- The default CORS configuration allows the local frontend origin only.
- Production deployment should provide strong secret values and configurable frontend/API URLs.
- Model and TTS assets must be installed separately because they are not stored in Git.
