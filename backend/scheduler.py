from apscheduler.schedulers.background import BackgroundScheduler

from news.serpapi_fetch import fetch_news
from news.cleaner import clean_article
from news.deduplicate import remove_duplicates
from news.article_extractor import extract_article_text
from database.database import db
from database.models import NewsArticle


CATEGORY_QUERIES = {
    "Technology": (
        "technology AI software hardware startups"
        " -sports -football -cricket"
    ),
    "Business": "business finance markets companies startups",
    "Sports": "sports football cricket basketball tennis",
    "Science": "science research space technology discovery",
    "Health": "health medicine healthcare medical research",
    "Entertainment": (
        "entertainment movies music television celebrities"
    ),
    "World": "world international news geopolitics"
}


def fetch_daily_news(app):
    """Fetch and store news for all supported categories."""

    with app.app_context():
        for category, query in CATEGORY_QUERIES.items():
            print(f"Fetching daily news: {category}")

            try:
                articles = fetch_news(query)

                cleaned_articles = [
                    clean_article(article)
                    for article in articles
                ]

                unique_articles = remove_duplicates(
                    cleaned_articles
                )

                for article in unique_articles:
                    link = article.get("link")

                    if not link:
                        continue

                    existing_article = NewsArticle.query.filter_by(
                        url=link
                    ).first()

                    if existing_article:
                        continue

                    content = extract_article_text(link)

                    if not content:
                        continue

                    news_article = NewsArticle(
                        title=article["title"],
                        source=article["source"],
                        url=link,
                        category=category,
                        content=content,
                        published_at=article["date"],
                        thumbnail=article["thumbnail"]
                    )

                    db.session.add(news_article)

                db.session.commit()

            except Exception as error:
                db.session.rollback()
                print(
                    f"Daily news fetch failed for "
                    f"{category}: {error}"
                )


def start_scheduler(app):
    """Start the hourly news scheduler."""

    scheduler = BackgroundScheduler()

    # Fetch news once when the server starts.
    try:
        print("Running initial news fetch...")
        fetch_daily_news(app)
        print("Initial news fetch completed.")
    except Exception as error:
        print(f"Initial news fetch failed: {error}")

    # Continue fetching automatically every hour.
    scheduler.add_job(
        func=fetch_daily_news,
        trigger="interval",
        hours=1,
        args=[app],
        id="hourly_news_fetch",
        replace_existing=True,
        max_instances=1,
        coalesce=True
    )

    scheduler.start()

    print("Hourly news scheduler started.")

    return scheduler