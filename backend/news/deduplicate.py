import difflib
from typing import List, Dict

def _calculate_similarity(text1: str, text2: str) -> float:
    """Calculate SequenceMatcher similarity between two strings."""
    if not text1 or not text2:
        return 0.0
    return difflib.SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def deduplicate_articles(articles: List[Dict], similarity_threshold: float = 0.75) -> List[Dict]:
    """
    Remove duplicate or near-duplicate news articles based on title similarity
    and matching canonical URLs.
    """
    if not articles:
        return []

    unique_articles = []
    seen_links = set()

    for article in articles:
        link = (article.get("link") or "").strip().rstrip("/")
        title = (article.get("title") or "").strip()

        # Direct link match
        if link and link in seen_links:
            continue

        # Near-duplicate check on title against already accepted articles
        is_duplicate = False
        for accepted in unique_articles:
            accepted_title = accepted.get("title", "")
            if _calculate_similarity(title, accepted_title) >= similarity_threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            if link:
                seen_links.add(link)
            unique_articles.append(article)

    return unique_articles

# Alias in case other legacy modules call it by this name
remove_duplicates = deduplicate_articles