/**
 * Returns the ISO 8601 week number (1–53) for a given date.
 * The first week of the year is the one containing the first Thursday.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Returns the file-system key for the week containing `date` (defaults to today).
 * Format: "KWxx_yyyy" — year is derived from the ISO Thursday to handle year boundaries.
 * Example: "KW10_2026"
 */
export function getCurrentWeekKey(date?: Date): string {
  const d = date ?? new Date()
  const week = getISOWeekNumber(d)
  // Use the year of the Thursday of the week (ISO 8601 rule)
  const thursday = new Date(d)
  thursday.setDate(d.getDate() + (4 - (d.getDay() || 7)))
  return `KW${week}_${thursday.getFullYear()}`
}

/**
 * Returns a human-readable label for the week containing `date`.
 * Example: "KW 10 / 2026"
 */
export function getWeekLabel(date?: Date): string {
  const d = date ?? new Date()
  const week = getISOWeekNumber(d)
  const thursday = new Date(d)
  thursday.setDate(d.getDate() + (4 - (d.getDay() || 7)))
  return `KW ${week} / ${thursday.getFullYear()}`
}

/** Returns the week key for the week following the one containing `date`. */
export function getNextWeekKey(date?: Date): string {
  const d = date ?? new Date()
  const next = new Date(d)
  next.setDate(d.getDate() + 7)
  return getCurrentWeekKey(next)
}

/**
 * Converts a stored week key back to a display label.
 * Example: "KW10_2026" → "KW 10 / 2026"
 */
export function weekKeyToLabel(key: string): string {
  const match = key.match(/KW(\d+)_(\d+)/)
  if (!match) return key
  return `KW ${match[1]} / ${match[2]}`
}
