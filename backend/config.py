import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "development-secret-key"
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "development-jwt-secret"
    )

    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Please configure the PostgreSQL connection in .env"
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SERPAPI_KEY = os.getenv("SERPAPI_KEY")

    BART_MODEL_PATH = os.getenv(
    "BART_MODEL_PATH",
    "models/news_bart_500"
    )

    TTS_ENGINE = os.getenv(
        "TTS_ENGINE",
        "coqui"
    )