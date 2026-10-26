import subprocess
import sys
import uuid
import wave
from pathlib import Path

from flask import (
    Blueprint,
    jsonify,
    request,
    send_file
)
from flask_jwt_extended import get_jwt_identity, jwt_required

from ai.preprocessing import combine_articles
from ai.summarizer_singleton import summarizer
from database.database import db
from database.models import NewsArticle, Podcast, UserSettings
from podcast.script_generator import generate_podcast_script


podcast_bp = Blueprint(
    "podcast",
    __name__,
    url_prefix="/api/podcast"
)

BASE_DIR = Path(__file__).resolve().parents[1]

TTS_PYTHON = (
    BASE_DIR
    / "tts_env"
    / "Scripts"
    / "python.exe"
)

TTS_WORKER = (
    BASE_DIR
    / "podcast"
    / "tts_worker.py"
)

AUDIO_DIR = (
    BASE_DIR
    / "storage"
    / "audio"
)

def get_audio_duration(audio_file):
    """Return WAV duration in seconds."""
    with wave.open(str(audio_file), "rb") as wav_file:
        frames = wav_file.getnframes()
        frame_rate = wav_file.getframerate()

    if frame_rate == 0:
        return 0

    return int(frames / frame_rate)


@podcast_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_podcast():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request",
            "message": "Request body must contain valid JSON.",
            "code": "INVALID_JSON"
        }), 400

    category = data.get("category")
    count = data.get("count")

    if not category:
        return jsonify({
            "error": "Invalid category",
            "message": "Category is required.",
            "code": "INVALID_CATEGORY"
        }), 400

    allowed_categories = {
        "Technology",
        "Business",
        "Sports",
        "Science",
        "Health",
        "Entertainment",
        "World"
    }

    if category not in allowed_categories:
        return jsonify({
            "error": "Invalid category",
            "message": (
                "Category must be one of: "
                + ", ".join(sorted(allowed_categories))
            ),
            "code": "INVALID_CATEGORY"
        }), 400

    if count is None:
        return jsonify({
            "error": "Invalid count",
            "message": "Count is required.",
            "code": "INVALID_COUNT"
        }), 400

    try:
        count = int(count)
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid count",
            "message": "Count must be an integer.",
            "code": "INVALID_COUNT"
        }), 400

    if count < 1 or count > 10:
        return jsonify({
            "error": "Invalid count",
            "message": "Count must be between 1 and 10.",
            "code": "INVALID_COUNT"
        }), 400

    user_id = int(get_jwt_identity())

    settings = UserSettings.query.filter_by(
        user_id=user_id
    ).first()

    if not settings:
        settings = UserSettings(
            user_id=user_id
        )

        db.session.add(settings)
        db.session.commit()

    limit = count

    query = NewsArticle.query

    if category:
        query = query.filter_by(
            category=category
        )

    articles = (
        query
        .order_by(NewsArticle.created_at.desc())
        .limit(limit)
        .all()
    )

    if not articles:
        return jsonify({
            "error": "No news articles found",
            "message": f"No news articles are currently available for {category}.",
            "code": "NO_NEWS"
        }), 404

    article_data = [
        {
            "title": article.title,
            "content": article.content
        }
        for article in articles
        if article.content
    ]

    if not article_data:
        return jsonify({
            "error": "No article content available",
            "message": "The available articles do not contain usable content.",
            "code": "NO_ARTICLE_CONTENT"
        }), 404

    combined_text = combine_articles(
        article_data
    )

    summary = summarizer.summarize(
        combined_text,
        max_length=150,
        min_length=40
    )

    if not summary:
        return jsonify({
            "error": "Failed to generate summary",
            "message": "The news summary could not be generated.",
            "code": "SUMMARY_ERROR"
        }), 500

    script = generate_podcast_script(
        summary,
        category
    )

    if not script:
        return jsonify({
            "error": "Failed to generate podcast script",
            "message": "The podcast conversation could not be generated.",
            "code": "SCRIPT_ERROR"
        }), 500

    podcast_id = str(uuid.uuid4())

    AUDIO_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    script_file = (
        AUDIO_DIR
        / f"{podcast_id}_script.txt"
    )

    audio_file = (
        AUDIO_DIR
        / f"{podcast_id}.wav"
    )

    script_file.write_text(
        script,
        encoding="utf-8"
    )

    try:
        result = subprocess.run(
            [
                str(TTS_PYTHON),
                str(TTS_WORKER),
                str(script_file),
                str(audio_file)
            ],
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR),
            check=False
        )

        if result.returncode != 0:
            print("TTS generation failed:")
            print(result.stderr)

            return jsonify({
                "error": "TTS generation failed",
                "message": "Unable to generate the podcast audio.",
                "code": "TTS_ERROR"
            }), 500

    finally:
        if script_file.exists():
            script_file.unlink()


    duration = get_audio_duration(audio_file)

    podcast = Podcast(
        user_id=user_id,
        title=f"{category} News Podcast",
        category=category,
        news_content=combined_text,
        summary=summary,
        script=script,
        audio_path=str(audio_file),
        duration=duration,
    )

    try:
        db.session.add(podcast)
        db.session.commit()
    except Exception:
        db.session.rollback()

        # Remove generated audio if database save fails
        if audio_file.exists():
            try:
                audio_file.unlink()
            except OSError:
                pass

        return jsonify({
            "error": "Podcast could not be saved",
            "message": "The podcast was generated but could not be saved.",
            "code": "DATABASE_ERROR"
        }), 500

    return jsonify({
        "message": "Podcast generated successfully",
        "podcast": {
            "id": podcast.id,
            "title": podcast.title,
            "category": podcast.category,
            "summary": podcast.summary,
            "script": podcast.script,
            "audio_url": f"/api/podcast/audio/{podcast.id}",
            "download_url": f"/api/podcast/download/{podcast.id}",
            "duration": podcast.duration,
            "created_at": podcast.created_at.isoformat()
        }
    }), 201

@podcast_bp.route("/audio/<int:podcast_id>", methods=["GET"])
@jwt_required()
def get_audio(podcast_id):
    """Serve a generated podcast audio file, only to its owner."""
    user_id = int(get_jwt_identity())

    podcast = Podcast.query.filter_by(
        id=podcast_id,
        user_id=user_id
    ).first()

    if not podcast:
        return jsonify({
            "error": "Podcast not found"
        }), 404

    audio_file = Path(podcast.audio_path)

    if not audio_file.exists():
        return jsonify({
            "error": "Audio file not found",
            "debug_path": str(audio_file.resolve()),
            "debug_exists": audio_file.exists()
        }), 404

    if audio_file.suffix.lower() != ".wav":
        return jsonify({
            "error": "Invalid audio file"
        }), 400

    return send_file(
        audio_file,
        mimetype="audio/wav",
        as_attachment=False,
        download_name=audio_file.name
    )

@podcast_bp.route("/download/<int:podcast_id>", methods=["GET"])
@jwt_required()
def download_audio(podcast_id):
    """Download a generated podcast audio file, only for its owner."""
    user_id = int(get_jwt_identity())

    podcast = Podcast.query.filter_by(
        id=podcast_id,
        user_id=user_id
    ).first()

    if not podcast:
        return jsonify({
            "error": "Podcast not found"
        }), 404

    audio_file = Path(podcast.audio_path)

    if not audio_file.exists():
        return jsonify({
            "error": "Audio file not found"
        }), 404

    if audio_file.suffix.lower() != ".wav":
        return jsonify({
            "error": "Invalid audio file"
        }), 400

    return send_file(
        audio_file,
        mimetype="audio/wav",
        as_attachment=True,
        download_name=audio_file.name
    )

@podcast_bp.route("/history", methods=["GET"])
@jwt_required()
def podcast_history():
    """Return podcasts belonging to the logged-in user."""
    user_id = int(get_jwt_identity())

    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()

    query = Podcast.query.filter_by(
        user_id=user_id
    )

    if search:
        query = query.filter(
            Podcast.title.ilike(f"%{search}%")
        )

    if category:
        query = query.filter(
            Podcast.category.ilike(category)
        )

    podcasts = (
        query
        .order_by(Podcast.created_at.desc())
        .all()
    )

    podcast_data = []

    for podcast in podcasts:
        podcast_data.append({
            "id": podcast.id,
            "title": podcast.title,
            "category": podcast.category,
            "summary": podcast.summary,
            "audio_url": f"/api/podcast/audio/{podcast.id}",
            "duration": podcast.duration,
            "created_at": podcast.created_at.isoformat()
        })

    return jsonify({
        "count": len(podcast_data),
        "search": search,
        "category": category,
        "podcasts": podcast_data
    }), 200

@podcast_bp.route("/<int:podcast_id>", methods=["GET"])
@jwt_required()
def get_podcast(podcast_id):
    """Return one podcast belonging to the logged-in user."""
    user_id = int(get_jwt_identity())

    podcast = Podcast.query.filter_by(
        id=podcast_id,
        user_id=user_id
    ).first()

    if not podcast:
        return jsonify({
            "error": "Podcast not found"
        }), 404

    return jsonify({
        "id": podcast.id,
        "title": podcast.title,
        "category": podcast.category,
        "news_content": podcast.news_content,
        "summary": podcast.summary,
        "script": podcast.script,
        "audio_url": f"/api/podcast/audio/{podcast.id}",
        "duration": podcast.duration,
        "created_at": podcast.created_at.isoformat()
    }), 200

@podcast_bp.route("/<int:podcast_id>", methods=["DELETE"])
@jwt_required()
def delete_podcast(podcast_id):
    """Delete a podcast belonging to the logged-in user."""
    user_id = int(get_jwt_identity())

    podcast = Podcast.query.filter_by(
        id=podcast_id,
        user_id=user_id
    ).first()

    if not podcast:
        return jsonify({
            "error": "Podcast not found"
        }), 404

    # Delete the generated audio file.
    if podcast.audio_path:
        audio_file = Path(podcast.audio_path)

        if audio_file.exists():
            try:
                audio_file.unlink()
            except OSError:
                pass

    db.session.delete(podcast)
    db.session.commit()

    return jsonify({
        "message": "Podcast deleted successfully",
        "podcast_id": podcast_id
    }), 200