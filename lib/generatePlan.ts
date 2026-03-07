import Anthropic from '@anthropic-ai/sdk'
import { FamilyContext, WeekPlan } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * JSON schema example passed to Claude to enforce the response structure.
 * The `child` field is optional — Claude should only include it when the
 * child's portion differs from the adult's.
 */
const JSON_SCHEMA = `{
  "week": "KWxx_yyyy",
  "generatedAt": "ISO timestamp",
  "days": [
    {
      "day": "Montag",
      "meals": [
        {
          "type": "Frühstück",
          "name": "Mahlzeitname",
          "description": "Kurze Beschreibung",
          "adult": { "kcal": 380, "ingredients": ["80g Haferflocken", "200ml Hafermilch"] },
          "child": { "kcal": 280, "ingredients": ["60g Haferflocken", "150ml Hafermilch"], "note": "Nur weglassen wenn identisch mit Erwachsenen-Portion" }
        }
      ]
    }
  ]
}`

/**
 * Generates a 7-day family meal plan by calling the Anthropic API with streaming.
 *
 * @param context  - Family configuration from data/context.json
 * @param weekKey  - Target week key, e.g. "KW10_2026"
 * @param onChunk  - Optional callback called with each streamed text chunk (used for SSE progress)
 * @returns        Parsed WeekPlan object ready to be saved to disk
 */
export async function generateWeekPlan(
  context: FamilyContext,
  weekKey: string,
  onChunk?: (text: string) => void
): Promise<WeekPlan> {
  const prompt = `Du bist ein professioneller Familienernährungsberater. Erstelle einen 7-Tage-Mahlzeitenplan für eine Familie.

Familienkontext: ${context.globalContext}

Familie:
- Erwachsene: ${context.adults} Person(en), je ca. ${context.adultKcal} kcal/Tag
- Kinder: ${context.children} Kind(er), je ca. ${context.childKcal} kcal/Tag
- Ernährung: ${context.diet}
- Vorlieben: ${context.preferences}
- Mag nicht: ${context.dislikes}

Regeln:
- Mengenangaben immer für GENAU 1 Erwachsenen (adult)
- Kinderversion (child) nur angeben wenn sie sich von der Erwachsenenversion unterscheidet (andere Zutaten, andere Menge, Weglassungen) – sonst weglassen
- Alle Zutaten mit genauen Grammangaben
- Kreative Mahlzeitennamen
- Milde Würzung, kindgerecht
- Alle 7 Tage: Montag bis Sonntag
- 3 Mahlzeiten pro Tag: Frühstück, Mittagessen, Abendessen
- Komplett auf Deutsch

Antworte NUR mit validem JSON gemäß diesem Schema:
${JSON_SCHEMA}

Setze "week" auf "${weekKey}" und "generatedAt" auf den aktuellen ISO-Timestamp.`

  let fullText = ''

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      fullText += chunk.delta.text
      onChunk?.(chunk.delta.text)
    }
  }

  // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
  const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
    fullText.match(/```\s*([\s\S]*?)\s*```/)
  const jsonString = jsonMatch ? jsonMatch[1] : fullText.trim()

  const plan: WeekPlan = JSON.parse(jsonString)
  return plan
}
