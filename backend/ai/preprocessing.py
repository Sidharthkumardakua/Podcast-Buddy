import re


def clean_article_text(text):
    """Clean article text before summarization."""

    if not text:
        return ""

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove common unwanted labels
    unwanted_labels = [
        "Company",
        "Read More",
        "Related Articles",
        "Related Stories",
        "Advertisement",
    ]

    for label in unwanted_labels:
        text = re.sub(
            rf"\b{re.escape(label)}\b",
            "",
            text,
            flags=re.IGNORECASE
        )

    # Clean whitespace again after removing labels
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def prepare_articles(articles):
    """Prepare multiple articles for summarization."""

    prepared_articles = []

    for article in articles:
        content = article.get("content", "")

        content = clean_article_text(content)

        if not content:
            continue

        prepared_articles.append({
            "title": article.get("title", ""),
            "content": content
        })

    return prepared_articles


def combine_articles(articles):
    """Combine multiple articles into one summarization input."""

    prepared_articles = prepare_articles(articles)

    sections = []

    for article in prepared_articles:
        title = article["title"]
        content = article["content"]

        sections.append(
            f"Title: {title}\n"
            f"{content}"
        )

    return "\n\n".join(sections)