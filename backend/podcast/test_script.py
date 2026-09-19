from podcast.script_generator import generate_podcast_script


summary = (
    "Business Insider asked 14 investors to name "
    "the 25 most promising robotics startups of 2026. "
    "The list includes companies at different stages "
    "of development. Falling hardware costs, labor "
    "shortages, and pressure to reshore manufacturing "
    "are fueling the robotics boom."
)


script = generate_podcast_script(
    summary,
    category="Technology"
)


print("=" * 70)
print("GENERATED PODCAST SCRIPT")
print("=" * 70)
print()
print(script)