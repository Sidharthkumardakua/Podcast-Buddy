import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./News.css";

type NewsArticle = {
  title: string;
  content: string;
};

type NewsResponse = {
  count: number;
  articles: NewsArticle[];
};

const categories = [
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
  "World",
];

function News() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search")?.trim() || "";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
   * If the search text exactly matches one of our categories,
   * treat it as a category search.
   *
   * Example:
   * ?search=sports
   *
   * becomes:
   * category = Sports
   * search = undefined
   */
  const searchedCategory =
    categories.find((item) => item.toLowerCase() === search.toLowerCase()) ||
    "";

  /*
   * When searching for a category, that category becomes the
   * selected category.
   *
   * For a normal search such as "robotics", no category is selected.
   */
  const activeCategory = search ? searchedCategory : category;

  useEffect(() => {
    let cancelled = false;

    const fetchNews = async () => {
      try {
        if (!cancelled) {
          setIsLoading(true);
          setError("");
          setArticles([]);
        }

        const response = await api.get<NewsResponse>("/news/latest", {
          params: {
            /*
             * Exact category searches use category filtering.
             *
             * Normal searches use the search parameter.
             */
            category: activeCategory || undefined,
            search: search && !searchedCategory ? search : undefined,
          },
        });

        if (!cancelled) {
          setArticles(response.data.articles);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Unable to load news. Make sure the backend is running.");
          setIsLoading(false);
        }
      }
    };

    void fetchNews();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, search, searchedCategory]);

  const loadNews = async (selectedCategory = activeCategory) => {
    try {
      setIsLoading(true);
      setError("");
      setArticles([]);

      const response = await api.get<NewsResponse>("/news/latest", {
        params: {
          category: selectedCategory || undefined,
          search: search && !searchedCategory ? search : undefined,
        },
      });

      setArticles(response.data.articles);
    } catch (err) {
      console.error(err);

      setError("Unable to load news. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNews = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      await api.get("/news/fetch", {
        params: {
          category: activeCategory || "Technology",

          query: search && !searchedCategory ? search : undefined,
        },
      });

      await loadNews(activeCategory);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to refresh news. Check the backend and news API configuration.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setError("");
    setArticles([]);
    setIsLoading(true);

    setCategory(selectedCategory);

    /*
     * Selecting a category removes any existing search query.
     *
     * Example:
     * /app/news?search=sports
     *
     * clicking Technology becomes:
     * /app/news
     *
     * with category = Technology.
     */
    setSearchParams({});
  };

  /*
   * Decide what label appears on each news card.
   */
  const getNewsLabel = () => {
    if (activeCategory) {
      return activeCategory;
    }

    if (search) {
      return `Search: ${search}`;
    }

    return "Latest";
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <div>
          <p className="section-label">EXPLORE</p>

          <h1>Latest news</h1>

          <p className="news-subtitle">
            Stay informed with stories prepared by Podcast Buddy AI.
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={refreshNews}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh news"}
        </button>
      </div>

      <div className="category-bar">
        <button
          type="button"
          className={`category-button ${
            !activeCategory && !search ? "active" : ""
          }`}
          onClick={() => handleCategoryChange("")}
        >
          All
        </button>

        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`category-button ${
              activeCategory === item ? "active" : ""
            }`}
            onClick={() => handleCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="news-state">
          <div className="loading-spinner" />

          <p>Loading the latest stories...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="news-error">
          <h3>Something went wrong</h3>

          <p>{error}</p>

          <button
            type="button"
            className="retry-button"
            onClick={() => loadNews(activeCategory)}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="news-empty">
          <div className="empty-icon">◉</div>

          <h3>No news available</h3>

          <p>
            There are no stored articles for this category yet. Try refreshing
            the news.
          </p>

          <button
            type="button"
            className="refresh-button"
            onClick={refreshNews}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Fetching..." : "Fetch latest news"}
          </button>
        </div>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="news-grid">
          {articles.map((article, index) => (
            <article className="news-card" key={`${article.title}-${index}`}>
              <div className="news-card-top">
                <span className="news-category">{getNewsLabel()}</span>

                <span className="news-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h2>{article.title}</h2>

              <p>
                {article.content.length > 260
                  ? `${article.content.slice(0, 260)}...`
                  : article.content}
              </p>

              <div className="news-card-footer">
                <span>Podcast Buddy AI</span>

                <span className="read-arrow">→</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;
