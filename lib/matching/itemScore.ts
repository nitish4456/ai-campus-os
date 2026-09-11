import { IItem } from "@/models/Item";

export interface ItemMatchResult {
  score: number; // 0 to 100
  reasons: string[];
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will",
  "with", "item", "lost", "found", "near", "on", "the", "this", "or", "my"
]);

function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return new Set(cleaned);
}

function calculateJaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  });

  const unionSize = tokens1.size + tokens2.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

function calculateLocationSimilarity(loc1?: string, loc2?: string): number {
  if (!loc1 || !loc2) return 0;
  const l1 = loc1.trim().toLowerCase();
  const l2 = loc2.trim().toLowerCase();

  if (l1 === l2) return 1.0;
  if (l1.includes(l2) || l2.includes(l1)) return 0.8;

  const tokens1 = tokenize(l1);
  const tokens2 = tokenize(l2);
  let overlap = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) overlap++;
  });

  if (overlap > 0) {
    const maxTokens = Math.max(tokens1.size, tokens2.size);
    return Math.min(1.0, (overlap / maxTokens) * 0.75 + 0.25);
  }

  return 0;
}

function calculateDateProximity(date1?: Date | string, date2?: Date | string): number {
  if (!date1 || !date2) return 0.5;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();

  if (isNaN(d1) || isNaN(d2)) return 0.5;

  const diffHours = Math.abs(d1 - d2) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffDays <= 0.5) return 1.0;
  if (diffDays <= 1) return 0.95;
  if (diffDays <= 2) return 0.85;
  if (diffDays <= 3) return 0.75;
  if (diffDays <= 5) return 0.6;
  if (diffDays <= 7) return 0.4;
  if (diffDays <= 14) return 0.2;
  return 0.0;
}

export function calculateItemScore(
  itemA: Partial<IItem>,
  itemB: Partial<IItem>
): ItemMatchResult {
  // 1. Category Match (30%)
  const catA = (itemA.category || "").trim().toLowerCase();
  const catB = (itemB.category || "").trim().toLowerCase();
  const categoryMatch = catA && catB && catA === catB ? 1.0 : 0.0;

  // 2. Text Similarity (35%)
  const textA = `${itemA.itemName || ""} ${itemA.description || ""}`;
  const textB = `${itemB.itemName || ""} ${itemB.description || ""}`;
  const textSimilarity = calculateJaccardSimilarity(textA, textB);

  // 3. Location Similarity (20%)
  const locationSimilarity = calculateLocationSimilarity(itemA.location, itemB.location);

  // 4. Date Proximity (15%)
  const dateProximity = calculateDateProximity(itemA.date, itemB.date);

  // Total weighted score
  const totalScore =
    categoryMatch * 0.30 +
    textSimilarity * 0.35 +
    locationSimilarity * 0.20 +
    dateProximity * 0.15;

  const percentageScore = Math.round(totalScore * 100);

  // Reasons determination
  const reasons: string[] = [];

  if (categoryMatch >= 0.8) {
    reasons.push("Same category");
  }
  if (textSimilarity >= 0.25) {
    reasons.push("Similar description");
  }
  if (locationSimilarity >= 0.4) {
    reasons.push("Nearby location");
  }
  if (dateProximity >= 0.5) {
    reasons.push("Close date");
  }

  return {
    score: percentageScore,
    reasons,
  };
}
