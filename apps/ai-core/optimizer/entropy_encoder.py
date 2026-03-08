"""Token entropy encoder for prompt compression."""

import math
import re
from collections import Counter

STOPWORDS = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "although", "though",
    "that", "which", "who", "whom", "this", "these", "those", "it", "its",
})


class TokenEntropyEncoder:
    """Compress prompts by removing low-entropy tokens.

    Low-entropy tokens (stopwords, repetitive words) are removed
    while preserving high-information-density tokens.
    """

    def __init__(self, entropy_threshold: float = 0.3):
        self.entropy_threshold = entropy_threshold

    def encode(self, text: str) -> str:
        """Compress text by removing low-entropy tokens."""
        words = text.split()
        if not words:
            return text

        freq = Counter(w.lower() for w in words)
        total = len(words)
        entropy_map = self._compute_entropy_map(freq, total)

        result = []
        for word in words:
            key = word.lower()
            if key in STOPWORDS:
                continue
            if entropy_map.get(key, 0) < self.entropy_threshold:
                continue
            result.append(word)

        return " ".join(result) if result else text

    def compression_stats(
        self, original: str, compressed: str
    ) -> dict:
        """Calculate compression statistics."""
        orig_tokens = len(original.split())
        comp_tokens = len(compressed.split())
        ratio = 1 - (comp_tokens / orig_tokens) if orig_tokens > 0 else 0.0

        return {
            "original_tokens": orig_tokens,
            "compressed_tokens": comp_tokens,
            "compression_ratio": round(ratio, 3),
            "tokens_saved": orig_tokens - comp_tokens,
        }

    def _compute_entropy_map(
        self, freq: Counter, total: int
    ) -> dict[str, float]:
        """Compute Shannon entropy contribution per unique word."""
        entropy_map = {}
        for word, count in freq.items():
            p = count / total
            entropy_map[word] = -p * math.log2(p) if p > 0 else 0.0
        return entropy_map


def _normalize_whitespace(text: str) -> str:
    """Collapse multiple whitespace characters into single spaces."""
    return re.sub(r"\s+", " ", text).strip()
