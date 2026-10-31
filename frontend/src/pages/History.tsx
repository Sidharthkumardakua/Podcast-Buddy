import { useEffect, useState } from "react";
import api from "../services/api";
import PodcastArtwork from "../components/PodcastArtwork";
import "./History.css";

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

type PodcastItem = {
  id: number;
  title: string;
  category: string;
  summary: string;
  audio_url: string;
  duration: number;
  created_at: string;
};

type HistoryResponse = {
  count: number;
  search: string;
  category: string;
  podcasts: PodcastItem[];
};

const getApiPath = (url: string) => {
  return url.replace(/^\/api(?=\/)/, "");
};

function History() {
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPodcast, setSelectedPodcast] =
    useState<PodcastItem | null>(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get<HistoryResponse>(
        "/podcast/history",
        {
          params: {
            search: search.trim() || undefined,
            category:
              category === "All" ? undefined : category,
          },
        }
      );

      setPodcasts(response.data.podcasts);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load your podcast library. Make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [category]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void loadHistory();
  };

  const playPodcast = async (podcast: PodcastItem) => {
    try {
      setSelectedPodcast(podcast);
      setIsAudioLoading(true);
      setError("");

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }

      const response = await api.get(
        getApiPath(podcast.audio_url),
        {
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setAudioUrl(blobUrl);
    } catch (err) {
      console.error(err);
      setError("Unable to load this podcast audio.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const downloadPodcast = async (podcast: PodcastItem) => {
    try {
      setDownloadingId(podcast.id);
      setError("");

      const response = await api.get(
        `/podcast/download/${podcast.id}`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${podcast.title.replace(
        /[^a-z0-9]+/gi,
        "_"
      )}.wav`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      setError("Unable to download this podcast.");
    } finally {
      setDownloadingId(null);
    }
  };

  const deletePodcast = async (podcast: PodcastItem) => {
    const confirmed = window.confirm(
      `Delete "${podcast.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(podcast.id);
      setError("");

      await api.delete(`/podcast/${podcast.id}`);

      if (selectedPodcast?.id === podcast.id) {
        setSelectedPodcast(null);

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl("");
        }
      }

      setPodcasts((current) =>
        current.filter((item) => item.id !== podcast.id)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to delete this podcast.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <p className="section-label">YOUR LIBRARY</p>

          <h1>Your podcasts</h1>

          <p className="history-subtitle">
            Listen to, download, and manage the podcasts you
            have created.
          </p>
        </div>

        <button
          type="button"
          className="history-refresh-button"
          onClick={() => void loadHistory()}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="history-toolbar">
        <form
          className="history-search"
          onSubmit={handleSearch}
        >
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your podcasts..."
          />

          <button type="submit">
            Search
          </button>
        </form>

        <div className="history-categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? "history-category active"
                  : "history-category"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="history-error">
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadHistory()}
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="history-state">
          <div className="loading-spinner" />
          <p>Loading your podcasts...</p>
        </div>
      )}

      {!isLoading && !error && podcasts.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">♫</div>

          <h2>Your library is empty</h2>

          <p>
            Podcasts you create will appear here so you can
            listen to them again later.
          </p>
        </div>
      )}

      {!isLoading && podcasts.length > 0 && (
        <div className="history-layout">
          <section className="history-list">
            <div className="history-list-header">
              <div>
                <p className="section-label">LIBRARY</p>
                <h2>
                  {podcasts.length}{" "}
                  {podcasts.length === 1
                    ? "podcast"
                    : "podcasts"}
                </h2>
              </div>
            </div>

            {podcasts.map((podcast) => (
              <article
                className={
                  selectedPodcast?.id === podcast.id
                    ? "history-card selected"
                    : "history-card"
                }
                key={podcast.id}
              >
                <PodcastArtwork
                  className="history-card-icon"
                  category={podcast.category}
                >
                  <span>{podcast.category.slice(0, 3).toUpperCase()}</span>
                </PodcastArtwork>

                <div className="history-card-content">
                  <div className="history-card-top">
                    <span>
                      {podcast.category}
                    </span>

                    <span>
                      {formatDate(podcast.created_at)}
                    </span>
                  </div>

                  <h3>{podcast.title}</h3>

                  <p>
                    {podcast.summary.length > 150
                      ? `${podcast.summary.slice(
                          0,
                          150
                        )}...`
                      : podcast.summary}
                  </p>

                  <div className="history-card-footer">
                    <span>
                      {formatDuration(
                        podcast.duration
                      )}
                    </span>

                    <div className="history-actions">
                      <button
                        type="button"
                        onClick={() =>
                          void playPodcast(podcast)
                        }
                      >
                        Play
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void downloadPodcast(podcast)
                        }
                        disabled={
                          downloadingId === podcast.id
                        }
                      >
                        {downloadingId === podcast.id
                          ? "Downloading..."
                          : "Download"}
                      </button>

                      <button
                        type="button"
                        className="delete-action"
                        onClick={() =>
                          void deletePodcast(podcast)
                        }
                        disabled={
                          deletingId === podcast.id
                        }
                      >
                        {deletingId === podcast.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="history-player">
            {selectedPodcast ? (
              <>
                <p className="section-label">
                  NOW SELECTED
                </p>

                <PodcastArtwork
                  className="history-selected-art"
                  category={selectedPodcast.category}
                />
                <h2>{selectedPodcast.title}</h2>

                <p className="history-player-meta">
                  {selectedPodcast.category} ·{" "}
                  {formatDuration(
                    selectedPodcast.duration
                  )}
                </p>

                {isAudioLoading ? (
                  <div className="history-player-loading">
                    <div className="loading-spinner" />
                    <p>Loading audio...</p>
                  </div>
                ) : audioUrl ? (
                  <audio
                    className="history-audio"
                    controls
                    autoPlay
                    src={audioUrl}
                  >
                    Your browser does not support the
                    audio player.
                  </audio>
                ) : (
                  <p className="history-player-error">
                    Audio unavailable.
                  </p>
                )}
              </>
            ) : (
              <div className="history-player-empty">
                <div>♫</div>
                <h3>Select a podcast</h3>
                <p>
                  Choose a podcast from your library to
                  start listening.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default History;