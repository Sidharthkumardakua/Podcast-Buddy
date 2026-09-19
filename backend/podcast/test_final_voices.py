from pathlib import Path

from TTS.api import TTS


MODEL_NAME = "tts_models/en/vctk/vits"

MAX_SPEAKER = "p230"
EMMA_SPEAKER = "p284"

BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "storage" / "audio"

MAX_OUTPUT = OUTPUT_DIR / "final_max_test.wav"
EMMA_OUTPUT = OUTPUT_DIR / "final_emma_test.wav"


def main():
    print("Loading VCTK model...")
    tts = TTS(MODEL_NAME)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print()
    print(f"Generating Max voice ({MAX_SPEAKER})...")

    tts.tts_to_file(
        text=(
            "Hello and welcome to Podcast Buddy AI. "
            "Today we're discussing the latest technology news. "
            "Let's take a closer look at the stories making headlines."
        ),
        speaker=MAX_SPEAKER,
        file_path=str(MAX_OUTPUT)
    )

    print(f"Max audio created: {MAX_OUTPUT}")

    print()
    print(f"Generating Emma voice ({EMMA_SPEAKER})...")

    tts.tts_to_file(
        text=(
            "Absolutely, Max. There is quite a bit happening "
            "in technology right now. Let's explore the most "
            "important stories and see why they matter."
        ),
        speaker=EMMA_SPEAKER,
        file_path=str(EMMA_OUTPUT)
    )

    print(f"Emma audio created: {EMMA_OUTPUT}")

    print()
    print("========================================")
    print("FINAL VOICE TEST COMPLETED")
    print("========================================")
    print(f"Max:  {MAX_SPEAKER}")
    print(f"Emma: {EMMA_SPEAKER}")


if __name__ == "__main__":
    main()