import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import "./Settings.css";

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

function Settings() {
  const [defaultCategory, setDefaultCategory] = useState("Technology");
  const [articleLimit, setArticleLimit] = useState(3);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<SettingsData>("/settings");

        setDefaultCategory(response.data.default_category);
        setArticleLimit(response.data.article_limit);
      } catch (err) {
        console.error(err);
        setError("Unable to load your settings.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setMessage("");
      setError("");

      const response = await api.put("/settings", {
        default_category: defaultCategory,
        article_limit: articleLimit,
      });

      setDefaultCategory(response.data.settings.default_category);
      setArticleLimit(response.data.settings.article_limit);

      setMessage("Settings saved successfully.");
        } catch (err) {
          console.error("Unable to save settings:", err);

          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to save your settings."
            );
          } else {
            setError("Unable to save your settings.");
          }
        } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="loading-spinner" />
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <p className="section-label">PREFERENCES</p>

        <h1>Settings</h1>

        <p className="settings-subtitle">
          Customize how Podcast Buddy AI prepares your news and podcasts.
        </p>
      </div>

      <section className="settings-card">
        <div className="settings-section">
          <div className="settings-section-heading">
            <h2>Podcast preferences</h2>

            <p>
              Choose the category and number of articles used when creating
              your podcasts.
            </p>
          </div>

          <div className="settings-form">
            <div className="settings-field">
              <label htmlFor="default-category">
                Default news category
              </label>

              <select
                id="default-category"
                value={defaultCategory}
                onChange={(event) =>
                  setDefaultCategory(event.target.value)
                }
                disabled={isSaving}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <span className="field-help">
                This category will be selected by default when creating a
                podcast.
              </span>
            </div>

            <div className="settings-field">
              <label htmlFor="article-limit">
                Default number of articles
              </label>

              <select
                id="article-limit"
                value={articleLimit}
                onChange={(event) =>
                  setArticleLimit(Number(event.target.value))
                }
                disabled={isSaving}
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "article" : "articles"}
                    </option>
                  )
                )}
              </select>

              <span className="field-help">
                Choose how many news stories should be used by default.
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="settings-error">
            {error}
          </div>
        )}

        {message && (
          <div className="settings-success">
            {message}
          </div>
        )}

        <div className="settings-actions">
          <button
            type="button"
            className="save-settings-button"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>

      <section className="settings-info-card">
        <div className="settings-info-icon">♫</div>

        <div>
          <h3>Podcast Buddy AI</h3>

          <p>
            Your preferences are saved to your account and will be available
            the next time you return.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Settings;