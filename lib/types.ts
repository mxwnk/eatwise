/** Family configuration stored in data/context.json. Edited via the Admin UI. */
export interface FamilyContext {
  /** Free-text description of the family and cooking setup. */
  globalContext: string
  /** Number of adults in the household. */
  adults: number
  /** Number of children in the household. */
  children: number
  /** Target daily calorie intake for one adult. */
  adultKcal: number
  /** Target daily calorie intake for one child. */
  childKcal: number
  /** Dietary requirements (e.g. "one adult vegetarian"). */
  diet: string
  /** Food preferences (e.g. "quick meals, international variety"). */
  preferences: string
  /** Dislikes and intolerances (e.g. "no fish, no spicy food"). */
  dislikes: string
}

/** Ingredient list and calorie count for one person's serving. */
export interface MealServing {
  /** Calories for this serving. */
  kcal: number
  /** Ingredients with exact gram amounts, e.g. "80g rolled oats". */
  ingredients: string[]
  /** Optional note shown in the child variant, e.g. "omit nuts". */
  note?: string
}

/**
 * A single meal (e.g. breakfast, lunch, dinner).
 * Amounts in `adult` are always for exactly 1 adult.
 * `child` is only set when the child version differs from the adult version.
 */
export interface Meal {
  /** Meal type label, e.g. "Frühstück", "Mittagessen", "Abendessen". */
  type: string
  /** Creative meal name. */
  name: string
  /** Short description for all family members. */
  description: string
  /** Serving for 1 adult — the base recipe. */
  adult: MealServing
  /** Serving for 1 child — only present when different from the adult version. */
  child?: MealServing
}

/** All meals for a single day. */
export interface DayPlan {
  /** German day name, e.g. "Montag". */
  day: string
  meals: Meal[]
}

/** A full generated week plan saved to data/plans/KWxx_yyyy.json. */
export interface WeekPlan {
  /** Week key, e.g. "KW10_2026". */
  week: string
  /** ISO 8601 timestamp of when the plan was generated. */
  generatedAt: string
  days: DayPlan[]
}

/** Lightweight plan metadata returned by GET /api/plans for the archive sidebar. */
export interface PlanMeta {
  week: string
  generatedAt: string
  /** Number of days present in the plan (normally 7). */
  dayCount: number
}
