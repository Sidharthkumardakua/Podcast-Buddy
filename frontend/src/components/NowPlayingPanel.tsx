import { usePlayer } from "../context/usePlayer";
import PodcastArtwork from "./PodcastArtwork";
import "./NowPlayingPanel.css";

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return "0 min";
  return `${Math.round(seconds / 60)} min`;
}

function formatTime(seconds: number) {
  if (!seconds || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function categoryTag(category?: string) {
  return (category || "NEWS").slice(0, 3).toUpperCase();
}

function NowPlayingPanel() {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    progress,
    togglePlay,
    playNext,
    playPrevious,
    playTrack,
    seek,
  } = usePlayer();
  const upNext = queue.filter((_, index) => index !== currentIndex);

  return (
    <aside className="now-playing-panel">
      <h3>Now Playing</h3>

      {currentTrack ? (
        <div className="now-playing-card">
          <PodcastArtwork
            className="now-playing-art"
            category={currentTrack.category}
          >
            <span>{categoryTag(currentTrack.category)}</span>
          </PodcastArtwork>
          <strong>{currentTrack.title}</strong>
          <span>Podcast Buddy AI</span>

          <div className="now-playing-progress">
            <input
              type="range"
              min={0}
              max={currentTrack.duration || 100}
              value={Math.min(progress, currentTrack.duration || 100)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Podcast progress"
            />
            <div>
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="now-playing-controls">
            <button type="button" onClick={playPrevious} aria-label="Previous">
              ⏮
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="now-playing-toggle"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button type="button" onClick={playNext} aria-label="Next">
              ⏭
            </button>
          </div>
        </div>
      ) : (
        <p className="now-playing-empty">
          Nothing playing yet — generate or open a podcast to start.
        </p>
      )}

      {upNext.length > 0 && (
        <div className="up-next">
          <h4>Up Next</h4>
          {upNext.map((track) => (
            <button
              key={track.id}
              type="button"
              className="up-next-item"
              onClick={() => void playTrack(track, queue)}
            >
              <PodcastArtwork
                className="up-next-icon"
                category={track.category}
              >
                {categoryTag(track.category)}
              </PodcastArtwork>
              <div>
                <strong>{track.title}</strong>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default NowPlayingPanel;
