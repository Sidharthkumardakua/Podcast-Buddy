from TTS.api import TTS


MODEL_NAME = "tts_models/en/vctk/vits"

MAX_SPEAKER = "p226"
EMMA_SPEAKER = "p225"

MAX_OUTPUT = "storage/audio/max_test.wav"
EMMA_OUTPUT = "storage/audio/emma_test.wav"


def main():
    print("Loading Coqui VCTK model...")

    tts = TTS(MODEL_NAME)

    print("Generating Max voice...")

    tts.tts_to_file(
        text=(
            "Hello and welcome to Podcast Buddy AI. "
            "Today we're discussing the latest technology news."
        ),
        speaker=MAX_SPEAKER,
        file_path=MAX_OUTPUT
    )

    print("Generating Emma voice...")

    tts.tts_to_file(
        text=(
            "Absolutely! There is quite a bit happening "
            "in technology right now. Let's take a closer look."
        ),
        speaker=EMMA_SPEAKER,
        file_path=EMMA_OUTPUT
    )

    print()
    print("TTS test completed successfully.")
    print(f"Max audio: {MAX_OUTPUT}")
    print(f"Emma audio: {EMMA_OUTPUT}")


if __name__ == "__main__":
    main()