import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { usePlayer } from "../context/usePlayer";
import type { Track } from "../context/PlayerContext";
import NowPlayingPanel from "../components/NowPlayingPanel";
import PodcastArtwork from "../components/PodcastArtwork";
import "./Home.css";

type NewsArticle = {
  title: string;
  content: string;
  source?: string;
  category?: string;
  published_at?: string;
  thumbnail?: string | null;
};
type SettingsData = {
  default_category: string;
  article_limit: number;
};
const categories = [
  "All",
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
  "World",
];

const categoryLabels: Record<string, string> = {
  Technology: "TECH",
  Business: "BUSINESS",
  Sports: "SPORTS",
  Science: "SCIENCE",
  Health: "HEALTH",
  Entertainment: "ENT",
  World: "WORLD",
};

function Home() {
  const { playTrack } = usePlayer();
  const [category, setCategory] = useState("All");
  const [defaultCategory, setDefaultCategory] = useState("Technology");
  const [articleLimit, setArticleLimit] = useState(3);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [podcasts, setPodcasts] = useState<Track[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get<SettingsData>("/settings");

        setDefaultCategory(response.data.default_category);
        setArticleLimit(response.data.article_limit);
      } catch (err) {
        console.error("Unable to load settings:", err);
      }
    };

    void loadSettings();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadNews = async () => {
      setIsLoadingNews(true);
      try {
        const newsRes = await api.get("/news/latest", {
          params: category === "All" ? undefined : { category },
        });
        if (!cancelled) {
          setArticles(newsRes.data.articles.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Unable to load latest news.");
      } finally {
        if (!cancelled) setIsLoadingNews(false);
      }
    };

    void loadNews();

    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    let cancelled = false;

    const loadPodcasts = async () => {
      setIsLoadingPodcasts(true);

      try {
        const response = await api.get("/podcast/history");
        if (!cancelled) {
          setPodcasts(response.data.podcasts.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Unable to load your podcasts.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPodcasts(false);
        }
      }
    };

    void loadPodcasts();

    return () => {
      cancelled = true;
    };
  }, []);

  const generateTodaysPodcast = async () => {
    try {
      setIsGenerating(true);
      setError("");
      const selectedCategory = category === "All" ? defaultCategory : category;

      const response = await api.post("/podcast/generate", {
        category: selectedCategory,
        count: articleLimit,
      });
      const podcast = response.data.podcast;
      await playTrack(podcast, [podcast, ...podcasts]);
      setPodcasts((current) => [podcast, ...current].slice(0, 4));
    } catch (err) {
      console.error(err);
      setError("Unable to generate today's podcast right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="home-layout">
      <div className="home-page">
        <section className="home-hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <span className="hero-eyebrow">PODCAST BUDDY AI</span>
            <h1>
              Turn News
              <br />
              Into Audio
            </h1>
            <p>
              AI-powered summaries and podcasts from today's top stories. Local
              BART summarization · No cloud LLM.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={generateTodaysPodcast}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "▶ Generate Today's Podcast"}
              </button>
              <Link to="/app/news" className="secondary-button">
                Explore News →
              </Link>
            </div>
          </div>
        </section>

        <div className="home-category-bar">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`home-category-button ${category === item ? "active" : ""}`}
              onClick={() => setCategory(item)}
              disabled={isLoadingNews || isGenerating}
            >
              {item}
            </button>
          ))}
        </div>

        {error && <p className="home-empty">{error}</p>}

        <section className="home-section">
          <div className="section-heading">
            <h2>Latest News</h2>
            <Link to="/app/news" className="text-button">
              View All →
            </Link>
          </div>
          {isLoadingNews ? (
            <p className="home-empty">Loading the latest stories...</p>
          ) : (
            <div className="quick-grid">
              {articles.map((article, index) => (
                <article
                  className="quick-card"
                  key={`${article.title}-${index}`}
                >
                  <div className="quick-card-image">
                    {article.thumbnail ? (
                      <img src={article.thumbnail} alt="" />
                    ) : (
                      <span>{article.category ?? category}</span>
                    )}
                  </div>

                  <div className="quick-card-body">
                    <div className="quick-card-meta">
                      <span className="news-card-category">
                        {article.category ?? category}
                      </span>
                      <span aria-hidden="true">♡</span>
                    </div>

                    <h3>{article.title}</h3>

                    <p>
                      {article.content.length > 110
                        ? `${article.content.slice(0, 110)}...`
                        : article.content}
                    </p>

                    <span className="quick-card-time">
                      {article.published_at ||
                        article.source ||
                        "Podcast Buddy AI"}
                    </span>
                  </div>
                </article>
              ))}
              {articles.length === 0 && (
                <div className="home-empty home-empty-action">
                  <p>No stored news yet — visit Explore to fetch some.</p>
                  <Link
                    to="/app/news"
                    className="secondary-button compact-button"
                  >
                    Explore News
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="home-section">
          <div className="section-heading">
            <h2>Featured Podcasts</h2>
            <Link to="/app/history" className="text-button">
              View All →
            </Link>
          </div>
          {isLoadingPodcasts ? (
            <p className="home-empty">Loading featured podcasts...</p>
          ) : (
            <div className="featured-grid">
              {podcasts.map((podcast) => (
                <button
                  type="button"
                  key={podcast.id}
                  className="featured-card"
                  onClick={() => void playTrack(podcast, podcasts)}
                >
                  <PodcastArtwork
                    className="featured-art featured-art-purple"
                    category={podcast.category}
                  >
                    <span>
                      {categoryLabels[podcast.category] ?? podcast.category}
                    </span>
                  </PodcastArtwork>
                  <div className="featured-info">
                    <span>{podcast.category}</span>
                    <h3>{podcast.title}</h3>
                  </div>
                </button>
              ))}
              {podcasts.length === 0 && (
                <div className="home-empty home-empty-action">
                  <p>No podcasts yet — generate one now.</p>
                  <button
                    type="button"
                    className="primary-button compact-button"
                    onClick={generateTodaysPodcast}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Podcast"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <NowPlayingPanel />
    </div>
  );
}

export default Home;
