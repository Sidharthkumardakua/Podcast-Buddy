from datasets import load_dataset

from transformers import (
    BartForConditionalGeneration,
    BartTokenizer,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments
)


MODEL_PATH = "models/news_bart"
OUTPUT_PATH = "models/news_bart_500"

TRAIN_SIZE = 500
VALIDATION_SIZE = 50

MAX_INPUT_LENGTH = 384
MAX_TARGET_LENGTH = 96


def load_training_data():
    """Load a CPU-friendly training and validation subset."""

    dataset = load_dataset(
        "abisee/cnn_dailymail",
        "3.0.0"
    )

    train_dataset = dataset["train"].select(
        range(TRAIN_SIZE)
    )

    validation_dataset = dataset["validation"].select(
        range(VALIDATION_SIZE)
    )

    return train_dataset, validation_dataset


def tokenize_dataset(dataset, tokenizer):
    """Tokenize articles and reference summaries."""

    def tokenize_function(examples):
        model_inputs = tokenizer(
            examples["article"],
            max_length=MAX_INPUT_LENGTH,
            truncation=True
        )

        labels = tokenizer(
            text_target=examples["highlights"],
            max_length=MAX_TARGET_LENGTH,
            truncation=True
        )

        model_inputs["labels"] = labels["input_ids"]

        return model_inputs

    return dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset.column_names
    )


def main():
    print("Loading dataset...")

    train_dataset, validation_dataset = (
        load_training_data()
    )

    print(
        f"Training examples: {len(train_dataset)}"
    )

    print(
        f"Validation examples: "
        f"{len(validation_dataset)}"
    )

    print("Loading tokenizer...")

    tokenizer = BartTokenizer.from_pretrained(
        MODEL_PATH
    )

    print("Loading BART model...")

    model = BartForConditionalGeneration.from_pretrained(
        MODEL_PATH
    )

    print("Tokenizing training dataset...")

    tokenized_train = tokenize_dataset(
        train_dataset,
        tokenizer
    )

    print("Tokenizing validation dataset...")

    tokenized_validation = tokenize_dataset(
        validation_dataset,
        tokenizer
    )

    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model
    )

    training_args = Seq2SeqTrainingArguments(
        output_dir=OUTPUT_PATH,

        eval_strategy="epoch",

        learning_rate=2e-5,

        per_device_train_batch_size=1,
        per_device_eval_batch_size=1,

        gradient_accumulation_steps=4,

        num_train_epochs=1,

        save_strategy="epoch",
        save_total_limit=1,

        logging_strategy="steps",
        logging_steps=50,

        predict_with_generate=True,

        report_to="none",

        fp16=False,
        bf16=False,

        use_cpu=True,

        dataloader_num_workers=0
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,

        train_dataset=tokenized_train,
        eval_dataset=tokenized_validation,

        processing_class=tokenizer,

        data_collator=data_collator
    )

    print("\nStarting 500-example CPU training...\n")

    trainer.train()

    print("\nTraining completed successfully.")

    print(
        f"Saving model to: {OUTPUT_PATH}"
    )

    trainer.save_model(OUTPUT_PATH)

    tokenizer.save_pretrained(
        OUTPUT_PATH
    )

    print("\n500-example model saved successfully.")


if __name__ == "__main__":
    main()