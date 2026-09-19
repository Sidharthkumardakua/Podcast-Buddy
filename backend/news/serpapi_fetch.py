import requests

from config import Config


def fetch_news(query, num_results=10):
    if not Config.SERPAPI_KEY:
        raise ValueError("SERPAPI_KEY is not configured")

    params = {
        "engine": "google_news",
        "q": query,
        "api_key": Config.SERPAPI_KEY,
        "hl": "en",
        "gl": "in",
    }

    response = requests.get(
        "https://serpapi.com/search.json",
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    news_results = data.get("news_results", [])

    articles = []

    for item in news_results[:num_results]:
        articles.append({
            "title": item.get("title"),
            "source": item.get("source", {}).get("name"),
            "link": item.get("link"),
            "snippet": item.get("snippet"),
            "date": item.get("date"),
            "thumbnail": item.get("thumbnail"),
        })

    return articles