from datasets import load_dataset


DATASET_NAME = "abisee/cnn_dailymail"
DATASET_CONFIG = "3.0.0"


def load_news_dataset():
    """Load the CNN/DailyMail summarization dataset."""

    dataset = load_dataset(
        DATASET_NAME,
        DATASET_CONFIG
    )

    return dataset


def show_dataset_sample():
    """Display one sample from the training dataset."""

    dataset = load_news_dataset()

    sample = dataset["train"][0]

    print("\nARTICLE:")
    print(sample["article"][:2000])

    print("\nREFERENCE SUMMARY:")
    print(sample["highlights"])


if __name__ == "__main__":
    show_dataset_sample()