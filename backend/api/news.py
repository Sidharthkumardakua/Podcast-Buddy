from flask import Blueprint, jsonify, request

from ai.preprocessing import prepare_articles
from database.database import db
from database.models import NewsArticle
from news.article_extractor import extract_article_text
from news.cleaner import clean_article
from news.deduplicate import remove_duplicates
from news.serpapi_fetch import fetch_news


news_bp = Blueprint(
    "news",
    __name__,
    url_prefix="/api/news"
)


CATEGORY_QUERIES = {
    "Technology": (
        "technology AI software hardware startups"
        " -sports -football -cricket"
    ),
    "Business": (
        "business finance markets companies startups"
    ),
    "Sports": (
        "sports football cricket basketball tennis"
    ),
    "Science": (
        "science research space technology discovery"
    ),
    "Health": (
        "health medicine healthcare medical research"
    ),
    "Entertainment": (
        "entertainment movies music television celebrities"
    ),
    "World": (
        "world international news geopolitics"
    )
}


@news_bp.route("/fetch", methods=["GET"])
def get_news():
    """Fetch, clean, extract and store news articles."""

    requested_query = request.args.get(
        "query",
        "technology news"
    )

    category = request.args.get(
        "category",
        "Technology"
    )

    # Use a category-specific query when a supported
    # category is provided.
    query = CATEGORY_QUERIES.get(
        category,
        requested_query
    )

    try:
        articles = fetch_news(query)

        cleaned_articles = [
            clean_article(article)
            for article in articles
        ]

        unique_articles = remove_duplicates(
            cleaned_articles
        )

        valid_articles = []

        for article in unique_articles:
            link = article.get("link")

            if not link:
                continue

            content = extract_article_text(link)

            if not content:
                continue

            article["content"] = content

            existing_article = NewsArticle.query.filter_by(
                url=link
            ).first()

            if existing_article:
                valid_articles.append(article)
                continue

            news_article = NewsArticle(
                title=article["title"],
                source=article["source"],
                url=link,
                category=category,
                content=article["content"],
                published_at=article["date"],
                thumbnail=article["thumbnail"]
            )

            db.session.add(news_article)
            valid_articles.append(article)

        db.session.commit()

        return jsonify({
            "query": query,
            "category": category,
            "count": len(valid_articles),
            "articles": valid_articles
        }), 200

    except ValueError as error:
        db.session.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    except Exception as error:
        db.session.rollback()

        return jsonify({
            "error": "Failed to fetch news",
            "details": str(error)
        }), 500


@news_bp.route("/latest", methods=["GET"])
def latest_news():
    """Return the latest prepared news content."""

    category = request.args.get("category")

    query = NewsArticle.query

    if category:
        query = query.filter_by(
            category=category
        )

    articles = query.order_by(
        NewsArticle.created_at.desc()
    ).limit(20).all()

    article_data = [
        {
            "title": article.title,
            "content": article.content
        }
        for article in articles
    ]

    prepared_articles = prepare_articles(
        article_data
    )

    return jsonify({
        "count": len(prepared_articles),
        "articles": prepared_articles
    }), 200









'''
@news_bp.route("/latest", methods=["GET"])
def latest_news():
    category = request.args.get("category")

    query = NewsArticle.query

    if category:
        query = query.filter_by(
            category=category
        )

    articles = query.order_by(
        NewsArticle.created_at.desc()
    ).limit(20).all()

    article_data = [
        {
            "title": article.title,
            "content": article.content
        }
        for article in articles
    ]

    prepared_articles = prepare_articles(
        article_data
    )

    return jsonify({
        "count": len(prepared_articles),
        "articles": prepared_articles
    }), 200

'''