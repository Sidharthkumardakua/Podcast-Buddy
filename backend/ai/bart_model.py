from transformers import BartForConditionalGeneration, BartTokenizer

from config import Config


class BartSummarizer:
    """Load and run the local BART summarization model."""

    def __init__(self):
        self.model_path = Config.BART_MODEL_PATH

        self.tokenizer = BartTokenizer.from_pretrained(
            self.model_path
        )

        self.model = BartForConditionalGeneration.from_pretrained(
            self.model_path
        )

        self.model.eval()

    def summarize(
        self,
        text,
        max_length=150,
        min_length=40
    ):
        """Generate a summary from input text."""

        if not text or not text.strip():
            return ""

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            max_length=1024,
            truncation=True
        )

        summary_ids = self.model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=max_length,
            min_length=min_length,
            num_beams=4,
            early_stopping=True
        )

        summary = self.tokenizer.decode(
            summary_ids[0],
            skip_special_tokens=True
        )

        return summary.strip()