import { useEffect, useState } from "react";
import axios from "axios";

import api from "../services/api";
import PodcastArtwork from "../components/PodcastArtwork";

import "./Podcast.css";

const categories = [
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
  "World",
];

type SettingsData = {
  default_category: string;
  article_limit: number;
};

type PodcastData = {
  id: number;
  title: string;
  category: string;
  summary: string;
  script: string;
  audio_url: string;
  download_url: string;
  duration: number;
  created_at: string;
};

type PodcastResponse = {
  message: string;
  podcast: PodcastData;
};

function Podcast() {
  const [category, setCategory] = useState("Technology");
  const [count, setCount] = useState(3);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [audioSrc, setAudioSrc] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        setError("");

        const response = await api.get<SettingsData>("/settings");

        if (response.data.default_category) {
          setCategory(response.data.default_category);
        }

        if (
          typeof response.data.article_limit === "number" &&
          response.data.article_limit >= 1
        ) {
          setCount(response.data.article_limit);
        }
      } catch (err) {
        console.error("Unable to load podcast settings:", err);

        // Keep the safe frontend defaults if settings cannot be loaded.
        setCategory("Technology");
        setCount(3);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    void loadSettings();
  }, []);

const getApiPath = (url: string) => {
  if (url.startsWith("/api/")) {
    return url.substring(4);
  }

  return url;
};

const generatePodcast = async () => {
  try {
    setIsGenerating(true);
    setError("");
    setPodcast(null);
    setAudioSrc("");

    const response = await api.post<PodcastResponse>(
      "/podcast/generate",
      {
        category,
        count,
      }
    );

    setPodcast(response.data.podcast);
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.error || err.response?.data?.message || "Unable to generate the podcast.");
    } else {
      setError("Unable to generate the podcast.");
    }
  } finally {
    setIsGenerating(false);
  }
};

useEffect(() => {
  let objectUrl = "";

  const loadAudio = async () => {
    if (!podcast?.audio_url) {
      setAudioSrc("");
      return;
    }

    try {
      const response = await api.get(
        getApiPath(podcast.audio_url),
        {
          responseType: "blob",
        }
      );

      objectUrl = URL.createObjectURL(response.data);
      setAudioSrc(objectUrl);
    } catch (err) {
      console.error("Unable to load podcast audio:", err);
      setAudioSrc("");
    }
  };

  void loadAudio();

  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [podcast]);

const downloadPodcast = async () => {
  if (!podcast?.download_url) {
    return;
  }

  try {
    const response = await api.get(
      getApiPath(podcast.download_url),
      {
        responseType: "blob",
      }
    );

    const blobUrl = URL.createObjectURL(response.data);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${podcast.title}.wav`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Unable to download podcast:", err);
    setError("Unable to download the podcast.");
  }
};

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="podcast-page">
      <div className="podcast-header">
        <div>
          <p className="section-label">PODCAST STUDIO</p>

          <h1>Create your podcast</h1>

          <p className="podcast-subtitle">
            Turn the latest news into an AI-generated podcast with two
            conversational hosts.
          </p>
        </div>
      </div>

      <section className="podcast-controls">
        <div className="control-group">
          <label htmlFor="podcast-category">
            Category
          </label>

          <select
            id="podcast-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={isGenerating || isLoadingSettings}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="podcast-count">
            Number of articles
          </label>

          <select
            id="podcast-count"
            value={count}
            onChange={(event) =>
              setCount(Number(event.target.value))
            }
            disabled={isGenerating || isLoadingSettings}
          >
            <option value={1}>1 article</option>
            <option value={2}>2 articles</option>
            <option value={3}>3 articles</option>
            <option value={4}>4 articles</option>
            <option value={5}>5 articles</option>
            <option value={6}>6 articles</option>
            <option value={7}>7 articles</option>
            <option value={8}>8 articles</option>
            <option value={9}>9 articles</option>
            <option value={10}>10 articles</option>
          </select>
        </div>

        <button
          type="button"
          className="generate-podcast-button"
          onClick={generatePodcast}
          disabled={isGenerating || isLoadingSettings}
        >
          {isLoadingSettings
            ? "Loading preferences..."
            : isGenerating
              ? "Generating podcast..."
              : "Create podcast"}
        </button>
      </section>

      {isGenerating && (
        <section className="podcast-loading">
          <div className="loading-spinner" />

          <h2>Creating your podcast...</h2>

          <p>
            Podcast Buddy AI is preparing the news, writing the
            conversation, and generating the voices.
          </p>

          <p className="loading-note">
            This can take some time because the audio is generated
            locally by the backend.
          </p>
        </section>
      )}

      {error && !isGenerating && (
        <section className="podcast-error">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={generatePodcast}
            className="retry-podcast-button"
          >
            Try again
          </button>
        </section>
      )}

      {podcast && !isGenerating && (
        <section className="podcast-result">
          <div className="podcast-result-header">
            <div>
              <p className="section-label">YOUR PODCAST</p>

              <h2>{podcast.title}</h2>

              <p className="podcast-meta">
                {podcast.category} ·{" "}
                {formatDuration(podcast.duration)}
              </p>
            </div>

            <button
              type="button"
              className="download-podcast-button"
              onClick={downloadPodcast}
            >
              Download
            </button>
          </div>

          <div className="podcast-player">
            <PodcastArtwork
              className="player-icon"
              category={podcast.category}
            >
              <span>
                {podcast.category.slice(0, 3).toUpperCase()}
              </span>
            </PodcastArtwork>

            <div className="player-info">
              <strong>Podcast Buddy AI</strong>

              <span>
                Your {podcast.category.toLowerCase()} briefing
              </span>
            </div>
          </div>

          <audio
            className="audio-player"
            controls
            src={audioSrc}
          >
            Your browser does not support the audio player.
          </audio>

          <div className="podcast-summary">
            <p className="section-label">SUMMARY</p>

            <h3>What you'll hear</h3>

            <p>{podcast.summary}</p>
          </div>

          <div className="podcast-script">
            <p className="section-label">SCRIPT</p>

            <h3>Conversation</h3>

            <div className="script-content">
              {podcast.script
                .split("\n\n")
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </div>
          </div>
        </section>
      )}

      {!podcast && !isGenerating && !error && !isLoadingSettings && (
        <section className="podcast-empty">
          <div className="podcast-empty-icon">
            ♫
          </div>

          <h2>Your podcast is waiting</h2>

          <p>
            Choose a category and the number of stories, then create
            your first AI podcast.
          </p>
        </section>
      )}
    </div>
  );
}

export default Podcast;