/**
 * POST /api/generate  { week?: string }
 *
 * Generates a weekly meal plan for the given calendar week (defaults to current week)
 * by calling the Anthropic API via generateWeekPlan().
 *
 * The response is a Server-Sent Events (SSE) stream with three event types:
 *   { type: 'chunk', text: string }  – incremental text from Claude (for progress bar)
 *   { type: 'done',  plan: WeekPlan }– full parsed plan once generation is complete
 *   { type: 'error', message: string }– human-readable error message on failure
 *
 * On success the plan is saved to data/plans/KWxx_yyyy.json.
 */
import { NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { generateWeekPlan } from '@/lib/generatePlan'
import { getCurrentWeekKey } from '@/lib/getWeekNumber'
import { FamilyContext } from '@/lib/types'

const CONTEXT_PATH = path.join(process.cwd(), 'data', 'context.json')
const PLANS_DIR = path.join(process.cwd(), 'data', 'plans')

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const raw = await readFile(CONTEXT_PATH, 'utf-8')
    const context: FamilyContext = JSON.parse(raw)
    const weekKey: string = body.week ?? getCurrentWeekKey()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = ''

          const plan = await generateWeekPlan(context, weekKey, (chunk) => {
            buffer += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
            )
          })

          // Persist the generated plan to disk
          await mkdir(PLANS_DIR, { recursive: true })
          const planPath = path.join(PLANS_DIR, `${weekKey}.json`)
          await writeFile(planPath, JSON.stringify(plan, null, 2), 'utf-8')

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', plan })}\n\n`)
          )
          controller.close()
        } catch (err) {
          let msg = err instanceof Error ? err.message : 'Unknown error'
          // Extract human-readable message from Anthropic API error JSON
          try {
            const match = msg.match(/\{.*\}/)
            if (match) {
              const parsed = JSON.parse(match[0])
              msg = parsed?.error?.message ?? msg
            }
          } catch { /* keep original */ }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
