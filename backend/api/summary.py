from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ai.preprocessing import combine_articles
from ai.summarizer_singleton import summarizer
from database.database import db
from database.models import NewsArticle


summary_bp = Blueprint(
    "summary",
    __name__,
    url_prefix="/api/summary"
)


@summary_bp.route("", methods=["POST"])
@jwt_required()
def generate_summary():
    """Generate a summary from stored news articles."""

    data = request.get_json(silent=True) or {}

    category = data.get("category")
    limit = data.get("limit", 3)

    try:
        limit = int(limit)
    except (TypeError, ValueError):
        return jsonify({
            "error": "Limit must be a valid integer"
        }), 400

    if limit < 1 or limit > 10:
        return jsonify({
            "error": "Limit must be between 1 and 10"
        }), 400

    query = NewsArticle.query

    if category:
        query = query.filter_by(
            category=category
        )

    articles = query.order_by(
        NewsArticle.created_at.desc()
    ).limit(limit).all()

    if not articles:
        return jsonify({
            "error": "No news articles found"
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
            "error": "No article content available"
        }), 404

    combined_text = combine_articles(article_data)

    if not combined_text:
        return jsonify({
            "error": "Unable to prepare article content"
        }), 400

    summary = summarizer.summarize(
        combined_text,
        max_length=150,
        min_length=40
    )

    if not summary:
        return jsonify({
            "error": "Failed to generate summary"
        }), 500

    return jsonify({
        "category": category,
        "article_count": len(article_data),
        "summary": summary
    }), 200