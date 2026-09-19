from app import app
from database.models import NewsArticle


with app.app_context():
    articles = NewsArticle.query.order_by(
        NewsArticle.created_at.desc()
    ).limit(10).all()

    for article in articles:
        print("=" * 70)
        print("CATEGORY:", article.category)
        print("TITLE:", article.title)
        print("CONTENT:", article.content[:300])