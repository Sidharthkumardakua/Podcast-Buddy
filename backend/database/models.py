from datetime import datetime

from database.database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    podcasts = db.relationship(
        "Podcast",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )


class NewsArticle(db.Model):
    __tablename__ = "news_articles"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(
        db.String(500),
        nullable=False
    )

    source = db.Column(
        db.String(255),
        nullable=False
    )

    url = db.Column(
        db.String(1000),
        unique=True,
        nullable=False
    )

    category = db.Column(
        db.String(100),
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    published_at = db.Column(
        db.String(100)
    )

    thumbnail = db.Column(
        db.String(1000)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )


class Podcast(db.Model):
    __tablename__ = "podcasts"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    category = db.Column(
        db.String(100)
    )

    news_content = db.Column(
        db.Text
    )

    summary = db.Column(
        db.Text
    )

    script = db.Column(
        db.Text
    )

    audio_path = db.Column(
        db.String(500)
    )

    duration = db.Column(
        db.Integer
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    default_category = db.Column(
        db.String(100),
        default="Technology",
        nullable=False
    )

    article_limit = db.Column(
        db.Integer,
        default=3,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )