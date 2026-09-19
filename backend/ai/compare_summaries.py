from datasets import load_dataset

from transformers import (
    BartForConditionalGeneration,
    BartTokenizer
)


BASE_MODEL = "models/news_bart"
FINE_TUNED_MODEL = "models/news_bart_200"

NUM_EXAMPLES = 3

MAX_INPUT_LENGTH = 384
MAX_GENERATION_LENGTH = 96


def generate_summary(model_path, article):
    """Generate a summary using a local BART model."""

    tokenizer = BartTokenizer.from_pretrained(
        model_path
    )

    model = BartForConditionalGeneration.from_pretrained(
        model_path
    )

    model.eval()

    inputs = tokenizer(
        article,
        max_length=MAX_INPUT_LENGTH,
        truncation=True,
        return_tensors="pt"
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=MAX_GENERATION_LENGTH,
        num_beams=4,
        early_stopping=True
    )

    return tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )


def main():
    print("Loading validation dataset...")

    dataset = load_dataset(
        "abisee/cnn_dailymail",
        "3.0.0"
    )

    validation_dataset = dataset[
        "validation"
    ].select(
        range(NUM_EXAMPLES)
    )

    for index, example in enumerate(
        validation_dataset
    ):
        print("\n" + "=" * 70)
        print(f"EXAMPLE {index + 1}")
        print("=" * 70)

        print("\nARTICLE:")
        print(example["article"][:1500])

        print("\nREFERENCE SUMMARY:")
        print(example["highlights"])

        print("\nBASE BART SUMMARY:")
        print(
            generate_summary(
                BASE_MODEL,
                example["article"]
            )
        )

        print("\nFINE-TUNED 200 SUMMARY:")
        print(
            generate_summary(
                FINE_TUNED_MODEL,
                example["article"]
            )
        )


if __name__ == "__main__":
    main()