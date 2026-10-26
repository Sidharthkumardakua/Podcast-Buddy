# Podcast Buddy AI

Podcast Buddy AI is a local news-to-podcast application. Its Flask API fetches news, generates article summaries with a local BART model, creates podcast scripts, and can generate WAV audio with a separate Coqui TTS environment. The React and TypeScript frontend provides the user interface.

## Project layout

- `backend/`: Flask API, database, news fetching, summarization, and podcast generation
- `frontend/`: React, TypeScript, and Vite application
- `backend/models/`: local BART model files (not included in Git)
- `backend/storage/audio/`: generated audio (not included in Git)

## Requirements

- Python 3.11 recommended
- Node.js and npm
- A local BART model directory to start the backend
- A SerpAPI key to fetch news
- A separately installed Coqui TTS environment to generate podcast audio

Model files, TTS packages, and TTS assets are not included in this repository.

## Backend setup (Windows PowerShell)

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` (the current directory is `backend`) and set your secrets and SerpAPI key:

```env
SECRET_KEY=replace-with-a-long-random-value
JWT_SECRET_KEY=replace-with-another-long-random-value
SERPAPI_KEY=your-serpapi-key
BART_MODEL_PATH=models/news_bart
```

Generate unique secret values for local development. Never commit `.env` or real credentials.

The BART model directory must exist before starting the API because the summarizer loads during application startup. `BART_MODEL_PATH` is relative to `backend/` unless you provide an absolute path. The default in `.env.example` is `models/news_bart`; set it to the directory containing your model files. Model files are excluded from Git, so obtain or train a compatible model separately.

Start the API from the `backend` directory:

```powershell
python app.py
```

The API listens at `http://localhost:5000`. On startup, it attempts to fetch news and then schedules hourly fetches. Without a valid `SERPAPI_KEY`, those fetch attempts fail and news fetching will not work, but the key is not needed just to start the server.

## Frontend setup

Open a second terminal at the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The frontend currently sends API requests to `http://localhost:5000/api`.

Available frontend checks:

```powershell
npm run build
npm run lint
```

## Podcast audio (optional)

Audio generation calls `backend/podcast/tts_worker.py` using this Windows interpreter path:

```text
backend/tts_env/Scripts/python.exe
```

Create and install a compatible Coqui TTS environment at that path separately; it is intentionally not part of `backend/requirements.txt`. Podcast audio is written under `backend/storage/audio/`.

## Notes

- The default database is SQLite and is created locally; database files are ignored by Git.
- The backend allows the local frontend origin `http://localhost:5173` via CORS.
- Do not commit local virtual environments, `.env` files, model files, generated audio, databases, or build/dependency directories.
- For deployment, configure secure secrets, allowed frontend origins, API URLs, model storage, and TTS separately.
