import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";

export type Track = {
  id: number;
  title: string;
  category: string;
  duration: number;
  audio_url: string; // e.g. "/api/podcast/audio/12"
  created_at: string;
};

type PlayerContextType = {
  queue: Track[];
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
};

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const toApiPath = (url: string) => url.replace(/^\/api(?=\/)/, "");

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string>("");

  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  const loadAndPlay = useCallback(async (track: Track) => {
    setIsLoading(true);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    try {
      const response = await api.get(toApiPath(track.audio_url), { responseType: "blob" });
      const blobUrl = URL.createObjectURL(response.data);
      objectUrlRef.current = blobUrl;
      if (audioRef.current) {
        audioRef.current.src = blobUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Unable to load podcast audio:", err);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    const effectiveQueue = newQueue ?? [track];
    const index = effectiveQueue.findIndex((item) => item.id === track.id);
    setQueue(effectiveQueue);
    setCurrentIndex(index === -1 ? 0 : index);
    await loadAndPlay(track);
  }, [loadAndPlay]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const playNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= queue.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    void loadAndPlay(queue[nextIndex]);
  }, [currentIndex, queue, loadAndPlay]);

  const playPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    void loadAndPlay(queue[prevIndex]);
  }, [currentIndex, queue, loadAndPlay]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    const handleTimeUpdate = () => setProgress(audioEl.currentTime);
    const handleEnded = () => playNext();
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("ended", handleEnded);
    return () => {
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{ queue, currentTrack, currentIndex, isPlaying, isLoading, progress, playTrack, togglePlay, playNext, playPrevious, seek }}
    >
      {children}
      <audio ref={audioRef} style={{ display: "none" }} />
    </PlayerContext.Provider>
  );
}