import re
from html import unescape


def clean_text(text):
    if not text:
        return ""

    text = unescape(text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def clean_article(article):
    return {
        "title": clean_text(article.get("title")),
        "source": clean_text(article.get("source")),
        "link": article.get("link"),
        "snippet": clean_text(article.get("snippet")),
        "date": article.get("date"),
        "thumbnail": article.get("thumbnail"),
    }