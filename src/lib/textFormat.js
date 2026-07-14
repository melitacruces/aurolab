const TITLE_CONNECTORS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "before",
  "between",
  "but",
  "by",
  "during",
  "for",
  "from",
  "if",
  "in",
  "into",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "so",
  "the",
  "through",
  "to",
  "via",
  "with",
  "without",
  "within",
  "yet",
]);

function isProtectedWord(word) {
  return /^[A-Z0-9]{2,}$/.test(word) || /[a-z][A-Z]/.test(word);
}

export function toTitleCase(value) {
  if (typeof value !== "string" || !value.trim()) return value;

  const words = value.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g) || [];
  let wordIndex = 0;

  return value.replace(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g, (word) => {
    const currentIndex = wordIndex;
    wordIndex += 1;

    if (isProtectedWord(word)) return word;

    const normalized = word.toLocaleLowerCase("en");
    const isEdgeWord = currentIndex === 0 || currentIndex === words.length - 1;

    if (!isEdgeWord && TITLE_CONNECTORS.has(normalized)) return normalized;
    return normalized.charAt(0).toLocaleUpperCase("en") + normalized.slice(1);
  });
}
