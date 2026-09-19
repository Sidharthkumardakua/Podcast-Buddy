def generate_podcast_script(
    summary,
    category="Technology"
):
    """Generate a two-host conversational podcast script."""

    if not summary or not summary.strip():
        return ""

    summary = summary.strip()

    introduction = (
        f"Max: Welcome back to Podcast Buddy AI! "
        f"Today we're talking about the latest "
        f"{category} news."
    )

    opening_question = (
        f"Emma: Absolutely! There's quite a bit happening "
        f"in {category.lower()} right now. "
        f"What should we focus on first?"
    )

    main_discussion = (
        f"Max: One of the key stories today is this: "
        f"{summary}"
    )

    response = (
        "Emma: That's interesting. There are a few important "
        "points here that listeners should keep in mind."
    )

    follow_up = (
        "Max: So, if we had to sum up the story, "
        "what is the main takeaway for our listeners?"
    )

    takeaway = (
        f"Emma: The main takeaway is that these developments "
        f"could have an important impact on the "
        f"{category.lower()} landscape. "
        "We'll be watching how the story develops."
    )

    conclusion = (
        f"Max: And that's your {category.lower()} update "
        "from Podcast Buddy AI."
    )

    closing = (
        "Emma: Thanks for listening. We'll be back with "
        "more news and updates."
    )

    return (
        f"{introduction}\n\n"
        f"{opening_question}\n\n"
        f"{main_discussion}\n\n"
        f"{response}\n\n"
        f"{follow_up}\n\n"
        f"{takeaway}\n\n"
        f"{conclusion}\n\n"
        f"{closing}"
    )