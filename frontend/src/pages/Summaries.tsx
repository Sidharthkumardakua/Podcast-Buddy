import axios from "axios";
import { useState } from "react";
import api from "../services/api";
import "./Summaries.css";

const categories = [
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
  "World",
];

type SummaryResponse = {
  category: string | null;
  article_count: number;
  summary: string;
};

function Summaries() {
  const [category, setCategory] = useState("Technology");
  const [limit, setLimit] = useState(3);

  const [summary, setSummary] = useState("");
  const [articleCount, setArticleCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSummary("");

      const response = await api.post<SummaryResponse>("/summary", {
        category,
        limit,
      });

      setSummary(response.data.summary);
      setArticleCount(response.data.article_count);
    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || "Unable to generate summary.");
      } else {
        setError("Unable to generate summary.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="summaries-page">
      <div className="summaries-header">
        <div>
          <p className="section-label">AI SUMMARIES</p>

          <h1>Understand the news</h1>

          <p className="summaries-subtitle">
            Turn multiple news stories into one clear AI-generated briefing.
          </p>
        </div>
      </div>

      <section className="summary-controls">
        <div className="control-group">
          <label htmlFor="summary-category">Category</label>

          <select
            id="summary-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="summary-limit">Number of articles</label>

          <select
            id="summary-limit"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            <option value={1}>1 article</option>
            <option value={2}>2 articles</option>
            <option value={3}>3 articles</option>
            <option value={4}>4 articles</option>
            <option value={5}>5 articles</option>
          </select>
        </div>

        <button
          type="button"
          className="generate-summary-button"
          onClick={generateSummary}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate summary"}
        </button>
      </section>

      {error && (
        <div className="summary-error">
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="summary-loading">
          <div className="loading-spinner" />

          <h3>Preparing your briefing...</h3>

          <p>
            Podcast Buddy AI is reading the latest {category.toLowerCase()}{" "}
            stories.
          </p>
        </div>
      )}

      {!isLoading && !error && summary && (
        <section className="summary-result">
          <div className="summary-result-header">
            <div>
              <p className="section-label">AI BRIEFING</p>

              <h2>{category} intelligence</h2>
            </div>

            <span className="article-count">
              Based on {articleCount}{" "}
              {articleCount === 1 ? "article" : "articles"}
            </span>
          </div>

          <div className="summary-content">
            <p>{summary}</p>
          </div>
        </section>
      )}

      {!isLoading && !error && !summary && (
        <section className="summary-empty">
          <div className="summary-empty-icon">✦</div>

          <h2>Your AI briefing is waiting</h2>

          <p>
            Choose a category and generate a summary from the latest available
            news.
          </p>
        </section>
      )}
    </div>
  );
}

export default Summaries;
