import requests
import trafilatura


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    )
}


def extract_article_text(url):
    """Extract the main article text from a webpage."""

    #print("TRAFILATURA EXTRACTOR IS RUNNING")

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=20
        )

        response.raise_for_status()

        downloaded = response.content.decode(
            "utf-8",
            errors="replace"
        )

        article_text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            include_links=False,
            include_images=False,
            favor_precision=True
        )

        if not article_text:
            print("Trafilatura could not extract article")
            return ""

        article_text = article_text.strip()

        if len(article_text) < 300:
            print("Extracted article is too short")
            return ""

        print(
            f"Article extracted successfully: "
            f"{len(article_text)} characters"
        )

        return article_text

    except requests.RequestException as error:
        print(f"Article request failed: {error}")
        return ""

    except Exception as error:
        print(f"Article extraction failed: {error}")
        return ""