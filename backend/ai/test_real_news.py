from ai.bart_model import BartSummarizer
from ai.preprocessing import clean_article_text
from news.serpapi_fetch import fetch_news
from news.article_extractor import extract_article_text


def main():
    print("Loading fine-tuned BART model...")

    summarizer = BartSummarizer()

    print("Fetching real technology news...")

    articles = fetch_news(
        query="technology news",
        num_results=3
    )

    for index, article in enumerate(articles, start=1):
        title = article.get("title", "")
        url = article.get("link", "")

        print("\n" + "=" * 70)
        print(f"ARTICLE {index}")
        print("=" * 70)

        print("\nTITLE:")
        print(title)

        print("\nExtracting article content...")

        content = extract_article_text(url)

        if not content:
            print("Could not extract article content.")
            continue

        content = clean_article_text(content)

        print(f"Article length: {len(content)} characters")

        print("\nGenerating summary...")

        summary = summarizer.summarize(
            content,
            max_length=100,
            min_length=30
        )

        print("\nFINE-TUNED 500 SUMMARY:")
        print(summary)


if __name__ == "__main__":
    main()