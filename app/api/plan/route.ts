/**
 * GET /api/plan?week=KWxx_yyyy
 *
 * Returns the full WeekPlan JSON for the requested week.
 * Defaults to the current calendar week if no `week` param is provided.
 * Returns 404 if no plan file exists for that week.
 */
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getCurrentWeekKey } from '@/lib/getWeekNumber'

const PLANS_DIR = path.join(process.cwd(), 'data', 'plans')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const week = searchParams.get('week') ?? getCurrentWeekKey()

  try {
    const planPath = path.join(PLANS_DIR, `${week}.json`)
    const raw = await readFile(planPath, 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json(null, { status: 404 })
  }
}
