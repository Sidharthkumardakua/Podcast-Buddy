from datasets import load_dataset
import evaluate

from transformers import (
    BartForConditionalGeneration,
    BartTokenizer
)


MODELS = {
    "base": "models/news_bart",
    "fine_tuned_200": "models/news_bart_200",
    "fine_tuned_500": "models/news_bart_500"
}

VALIDATION_SIZE = 50

MAX_INPUT_LENGTH = 384
MAX_GENERATION_LENGTH = 96


def load_model(model_path):
    """Load a BART model and tokenizer once."""

    tokenizer = BartTokenizer.from_pretrained(
        model_path
    )

    model = BartForConditionalGeneration.from_pretrained(
        model_path
    )

    model.eval()

    return tokenizer, model


def generate_summary(
    tokenizer,
    model,
    article
):
    """Generate one summary."""

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


def evaluate_model(
    model_name,
    model_path,
    dataset,
    rouge
):
    """Evaluate one model."""

    print(f"\nLoading {model_name}...")

    tokenizer, model = load_model(
        model_path
    )

    predictions = []
    references = []

    for index, example in enumerate(dataset):
        print(
            f"{model_name}: "
            f"{index + 1}/{len(dataset)}"
        )

        prediction = generate_summary(
            tokenizer,
            model,
            example["article"]
        )

        predictions.append(prediction)
        references.append(
            example["highlights"]
        )

    scores = rouge.compute(
        predictions=predictions,
        references=references
    )

    return scores


def main():
    print("Loading CNN/DailyMail validation data...")

    dataset = load_dataset(
        "abisee/cnn_dailymail",
        "3.0.0"
    )

    validation_dataset = dataset[
        "validation"
    ].select(
        range(VALIDATION_SIZE)
    )

    rouge = evaluate.load("rouge")

    results = {}

    for model_name, model_path in MODELS.items():
        results[model_name] = evaluate_model(
            model_name,
            model_path,
            validation_dataset,
            rouge
        )

    print("\n")
    print("=" * 70)
    print("BART MODEL COMPARISON")
    print("=" * 70)

    for model_name, scores in results.items():
        print(f"\n{model_name.upper()}")

        for metric, score in scores.items():
            print(
                f"{metric}: {score:.4f}"
            )


if __name__ == "__main__":
    main()