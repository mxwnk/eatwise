/**
 * GET /api/context  – Returns the current family context (data/context.json).
 * PUT /api/context  – Overwrites data/context.json with the request body.
 */
import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { FamilyContext } from '@/lib/types'

const CONTEXT_PATH = path.join(process.cwd(), 'data', 'context.json')

export async function GET() {
  try {
    const raw = await readFile(CONTEXT_PATH, 'utf-8')
    const context: FamilyContext = JSON.parse(raw)
    return NextResponse.json(context)
  } catch {
    return NextResponse.json({ error: 'Could not read context' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body: FamilyContext = await request.json()
    await writeFile(CONTEXT_PATH, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not write context' }, { status: 500 })
  }
}
