import type { ReactNode } from "react";
import businessArtwork from "../assets/podcast-business.jpg";
import entertainmentArtwork from "../assets/podcast-entertainment.jpg";
import healthArtwork from "../assets/podcast-health.jpg";
import scienceArtwork from "../assets/podcast-science.jpg";
import sportsArtwork from "../assets/podcast-sports.jpg";
import technologyArtwork from "../assets/podcast-technology.jpg";
import worldArtwork from "../assets/podcast-world.jpg";

type PodcastArtworkProps = {
  category?: string;
  className: string;
  children?: ReactNode;
};

const categoryArtwork: Record<string, string> = {
  business: businessArtwork,
  entertainment: entertainmentArtwork,
  health: healthArtwork,
  science: scienceArtwork,
  sports: sportsArtwork,
  technology: technologyArtwork,
  world: worldArtwork,
};

function PodcastArtwork({
  category,
  className,
  children,
}: PodcastArtworkProps) {
  const artwork =
    categoryArtwork[category?.trim().toLowerCase() ?? ""] ??
    scienceArtwork;

  return (
    <div
      className={className}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10, 11, 18, 0.08), rgba(10, 11, 18, 0.58)), url("${artwork}")`,
      }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export default PodcastArtwork;
