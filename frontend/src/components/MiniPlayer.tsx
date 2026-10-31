import { usePlayer } from "../context/usePlayer";
import PodcastArtwork from "./PodcastArtwork";
import "./MiniPlayer.css";

function formatTime(seconds: number) {
  if (!seconds || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function categoryTag(category?: string) {
  return (category || "NEWS").slice(0, 3).toUpperCase();
}

function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    togglePlay,
    playNext,
    playPrevious,
    seek,
  } = usePlayer();
  if (!currentTrack) return null;
  const duration = currentTrack.duration || 0;

  return (
    <div className="mini-player">
      <div className="mini-player-track">
        <PodcastArtwork
          className="mini-player-icon"
          category={currentTrack.category}
        >
          <span>{categoryTag(currentTrack.category)}</span>
        </PodcastArtwork>
        <div>
          <strong>{currentTrack.title}</strong>
          <span>{currentTrack.category || "Podcast Buddy AI"}</span>
        </div>
      </div>

      <div className="mini-player-controls">
        <div className="mini-player-buttons">
          <button type="button" onClick={playPrevious} aria-label="Previous">
            ⏮
          </button>
          <button
            type="button"
            className="play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? "…" : isPlaying ? "⏸" : "▶"}
          </button>
          <button type="button" onClick={playNext} aria-label="Next">
            ⏭
          </button>
        </div>

        <div className="mini-player-progress">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={Math.min(progress, duration || 100)}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default MiniPlayer;
