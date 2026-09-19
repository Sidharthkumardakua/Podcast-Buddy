import os
import sys
from pathlib import Path
import wave


ESPEAK_PATH = r"C:\Program Files\eSpeak NG"

if os.path.exists(ESPEAK_PATH):
    os.environ["PATH"] += os.pathsep + ESPEAK_PATH


from TTS.api import TTS


MODEL_NAME = "tts_models/en/vctk/vits"

MAX_SPEAKER = "p230"
EMMA_SPEAKER = "p284"

BASE_DIR = Path(__file__).resolve().parents[1]
AUDIO_DIR = BASE_DIR / "storage" / "audio"
TEMP_DIR = AUDIO_DIR / "temp"


def generate_voice(tts, text, speaker, output_file):
    """Generate one WAV file using the selected speaker."""
    tts.tts_to_file(
        text=text,
        speaker=speaker,
        file_path=str(output_file)
    )


def combine_wav_files(input_files, output_file):
    """Combine WAV files into one WAV file."""
    if not input_files:
        raise ValueError("No audio files to combine")

    with wave.open(str(input_files[0]), "rb") as first:
        params = first.getparams()
        frames = [first.readframes(first.getnframes())]

    for input_file in input_files[1:]:
        with wave.open(str(input_file), "rb") as wav_file:
            current_params = wav_file.getparams()

            if (
                current_params.nchannels != params.nchannels
                or current_params.sampwidth != params.sampwidth
                or current_params.framerate != params.framerate
            ):
                raise ValueError(
                    "Audio files have incompatible WAV settings"
                )

            frames.append(
                wav_file.readframes(wav_file.getnframes())
            )

    with wave.open(str(output_file), "wb") as output:
        output.setparams(params)

        for frame_data in frames:
            output.writeframes(frame_data)


def generate_podcast(script, output_file):
    """Generate a complete Max + Emma podcast."""
    if not script or not script.strip():
        raise ValueError("Podcast script is empty")

    AUDIO_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    TEMP_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print("Loading VCTK model...")

    tts = TTS(MODEL_NAME)

    lines = [
        line.strip()
        for line in script.splitlines()
        if line.strip()
    ]

    audio_files = []

    for index, line in enumerate(lines):
        if line.startswith("Max:"):
            speaker = MAX_SPEAKER
            text = line[4:].strip()
            speaker_name = "Max"

        elif line.startswith("Emma:"):
            speaker = EMMA_SPEAKER
            text = line[5:].strip()
            speaker_name = "Emma"

        else:
            continue

        if not text:
            continue

        temp_file = TEMP_DIR / f"segment_{index:03d}.wav"

        print(
            f"Generating {speaker_name} "
            f"voice ({speaker})..."
        )

        generate_voice(
            tts,
            text,
            speaker,
            temp_file
        )

        audio_files.append(temp_file)

    if not audio_files:
        raise ValueError(
            "No valid Max or Emma lines found in script"
        )

    output_file = Path(output_file)

    print("Combining audio segments...")

    combine_wav_files(
        audio_files,
        output_file
    )

    for audio_file in audio_files:
        try:
            audio_file.unlink()
        except OSError:
            pass

    print("Podcast audio generated successfully.")
    print(f"Output: {output_file}")


def main():
    if len(sys.argv) != 3:
        print(
            "Usage: python tts_worker.py "
            "<script_file> <output_file>"
        )
        sys.exit(1)

    script_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    if not script_file.exists():
        print(f"Script file not found: {script_file}")
        sys.exit(1)

    script = script_file.read_text(
        encoding="utf-8"
    )

    generate_podcast(
        script,
        output_file
    )


if __name__ == "__main__":
    main()