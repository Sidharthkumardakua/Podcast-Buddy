import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "development-secret-key"
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "development-jwt-secret"
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///podcast_buddy.db"
    )

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