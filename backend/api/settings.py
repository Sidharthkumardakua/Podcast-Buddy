from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.database import db
from database.models import UserSettings


settings_bp = Blueprint(
    "settings",
    __name__,
    url_prefix="/api/settings"
)


ALLOWED_CATEGORIES = {
    "Technology",
    "Business",
    "Sports",
    "Science",
    "Health",
    "Entertainment",
    "World"
}


@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_settings():
    """Return settings for the logged-in user."""
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

    return jsonify({
        "default_category": settings.default_category,
        "article_limit": settings.article_limit
    }), 200


@settings_bp.route("", methods=["PUT"])
@jwt_required()
def update_settings():
    """Update settings for the logged-in user."""
    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}

    default_category = data.get("default_category")
    article_limit = data.get("article_limit")

    settings = UserSettings.query.filter_by(
        user_id=user_id
    ).first()

    if not settings:
        settings = UserSettings(
            user_id=user_id
        )
        db.session.add(settings)

    if default_category is not None:
        default_category = str(
            default_category
        ).strip()

        if default_category not in ALLOWED_CATEGORIES:
            return jsonify({
                "error": "Invalid category"
            }), 400

        settings.default_category = default_category

    if article_limit is not None:
        try:
            article_limit = int(article_limit)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Article limit must be a valid integer"
            }), 400

        if article_limit < 1 or article_limit > 10:
            return jsonify({
                "error": "Article limit must be between 1 and 10"
            }), 400

        settings.article_limit = article_limit

    db.session.commit()

    return jsonify({
        "message": "Settings updated successfully",
        "settings": {
            "default_category": settings.default_category,
            "article_limit": settings.article_limit
        }
    }), 200