import { CreateRecipeDTO } from '@/types/dtos';

/**
 * Parses a value that may be a number, a numeric string, a fraction string ("1/2"),
 * a mixed number string ("1 1/2"), or a unicode fraction ("½").
 */
function parseFraction(value: unknown): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();

  const unicodeFractions: Record<string, number> = {
    '¼': 0.25,  '½': 0.5,   '¾': 0.75,
    '⅓': 1/3,  '⅔': 2/3,
    '⅕': 0.2,  '⅖': 0.4,  '⅗': 0.6,  '⅘': 0.8,
    '⅙': 1/6,  '⅚': 5/6,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  };
  if (unicodeFractions[trimmed] !== undefined) return unicodeFractions[trimmed];

  // Mixed number: "1 1/2"
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);

  // Simple fraction: "1/2"
  const fraction = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fraction) return parseInt(fraction[1]) / parseInt(fraction[2]);

  const n = parseFloat(trimmed);
  return isNaN(n) ? 0 : n;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

function toStr(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * Sanitizes raw AI-generated recipe data into a valid CreateRecipeDTO.
 * Handles type coercions, fraction strings, empty string filtering, and missing fields
 * so the majority of AI output quirks are resolved silently before the user sees the form.
 */
export function sanitizeRecipeData(raw: unknown): CreateRecipeDTO {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const ingredients = Array.isArray(data.ingredients)
    ? data.ingredients
        .map((ing: unknown) => {
          const i = (ing && typeof ing === 'object' ? ing : {}) as Record<string, unknown>;
          return {
            name: toStr(i.name).trim(),
            quantity: parseFraction(i.quantity),
            unit: toStr(i.unit).trim(),
            notes: toStr(i.notes),
          };
        })
        .filter(i => i.name.length > 0)
    : [];

  const instructions = Array.isArray(data.instructions)
    ? data.instructions.map((s: unknown) => toStr(s).trim()).filter(s => s.length > 0)
    : [];

  const rawNutrition = (
    data.nutrition && typeof data.nutrition === 'object' ? data.nutrition : {}
  ) as Record<string, unknown>;

  const dietary =
    data.dietary && typeof data.dietary === 'object' && !Array.isArray(data.dietary)
      ? Object.fromEntries(
          Object.entries(data.dietary as Record<string, unknown>).map(([k, v]) => [k, Boolean(v)])
        )
      : {};

  const tags = Array.isArray(data.tags)
    ? data.tags.map((t: unknown) => toStr(t).trim()).filter(t => t.length > 0)
    : [];

  return {
    title: toStr(data.title),
    description: toStr(data.description),
    yield: toStr(data.yield),
    prepTime: toNumber(data.prepTime),
    cookTime: toNumber(data.cookTime),
    totalTime: toNumber(data.totalTime),
    ingredients,
    instructions,
    nutrition: {
      calories: Math.round(toNumber(rawNutrition.calories)),
      protein: toNumber(rawNutrition.protein),
      fat: toNumber(rawNutrition.fat),
      fiber: toNumber(rawNutrition.fiber),
      carbohydrates: toNumber(rawNutrition.carbohydrates),
      sugar: toNumber(rawNutrition.sugar),
    },
    dietary,
    tags,
  };
}
