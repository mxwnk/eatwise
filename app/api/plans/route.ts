/**
 * GET /api/plans
 *
 * Returns lightweight metadata for all generated plans in data/plans/.
 * Sorted newest-first. Corrupt or unreadable files are silently skipped.
 */
import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { PlanMeta } from '@/lib/types'

const PLANS_DIR = path.join(process.cwd(), 'data', 'plans')

export async function GET() {
  try {
    const files = await readdir(PLANS_DIR)
    const jsonFiles = files.filter((f) => f.endsWith('.json')).sort().reverse()

    const plans: PlanMeta[] = []
    for (const file of jsonFiles) {
      try {
        const raw = await readFile(path.join(PLANS_DIR, file), 'utf-8')
        const data = JSON.parse(raw)
        plans.push({
          week: data.week,
          generatedAt: data.generatedAt,
          dayCount: data.days?.length ?? 0,
        })
      } catch {
        // skip corrupt files
      }
    }

    return NextResponse.json(plans)
  } catch {
    // Plans directory doesn't exist yet — return empty list
    return NextResponse.json([])
  }
}
