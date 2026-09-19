from pathlib import Path

from TTS.api import TTS


MODEL_NAME = "tts_models/en/vctk/vits"

BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "storage" / "audio" / "vctk_audition"

SAMPLE_TEXT = (
    "Hello, and welcome to Podcast Buddy AI. "
    "Today, we're looking at the latest technology news."
)


def main():
    print("Loading VCTK model...")
    tts = TTS(MODEL_NAME)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Keep only the standard VCTK speaker IDs.
    speakers = [
        str(speaker).strip()
        for speaker in tts.speakers
        if str(speaker).strip().startswith("p")
    ]

    print(f"Found {len(speakers)} valid VCTK speakers.")
    print()

    for index, speaker in enumerate(speakers, start=1):
        output_file = OUTPUT_DIR / f"{index:03d}_{speaker}.wav"

        print(
            f"[{index}/{len(speakers)}] "
            f"Generating {speaker}"
        )

        tts.tts_to_file(
            text=SAMPLE_TEXT,
            speaker=speaker,
            file_path=str(output_file)
        )

    print()
    print("========================================")
    print("Voice audition generation completed.")
    print("========================================")
    print(f"Files saved to:")
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main()