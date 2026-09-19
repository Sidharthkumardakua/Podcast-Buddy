from app import app
from database.database import db
from database.models import NewsArticle


with app.app_context():
    deleted = NewsArticle.query.filter_by(
        category="Technology"
    ).delete()

    db.session.commit()

    print(
        f"Deleted {deleted} Technology articles."
    )