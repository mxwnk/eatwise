'use client'

import { useState } from 'react'
import { WeekPlan } from '@/lib/types'
import { getCurrentWeekKey, getNextWeekKey, weekKeyToLabel } from '@/lib/getWeekNumber'

interface GenerateButtonProps {
  onPlanGenerated: (plan: WeekPlan) => void
  variant?: 'primary' | 'secondary'
  label?: string
}

export default function GenerateButton({
  onPlanGenerated,
  variant = 'primary',
  label = 'Plan generieren',
}: GenerateButtonProps) {
  const currentWeek = getCurrentWeekKey()
  const nextWeek = getNextWeekKey()

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const [open, setOpen] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setProgress(0)
    setOpen(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: selectedWeek }),
      })
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event: { type: string; text?: string; plan?: unknown; message?: string } | null = null
          try {
            event = JSON.parse(line.slice(6))
          } catch {
            continue
          }
          if (event?.type === 'chunk') {
            setProgress((p) => Math.min(p + 1, 95))
          } else if (event?.type === 'done') {
            setProgress(100)
            onPlanGenerated(event.plan as Parameters<typeof onPlanGenerated>[0])
          } else if (event?.type === 'error') {
            throw new Error(event.message)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren')
    } finally {
      setLoading(false)
    }
  }

  const baseClass =
    variant === 'primary'
      ? 'bg-green-500 hover:bg-green-600 text-white'
      : 'bg-white border border-green-500 text-green-600 hover:bg-green-50'

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {/* Week selector */}
        {!loading && (
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 hover:border-gray-300 transition-colors flex items-center gap-1.5"
            >
              <span className="text-green-600 font-medium">{weekKeyToLabel(selectedWeek)}</span>
              <span className="text-gray-400">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
                {[
                  { key: currentWeek, label: weekKeyToLabel(currentWeek), badge: 'Aktuell' },
                  { key: nextWeek, label: weekKeyToLabel(nextWeek), badge: 'Nächste' },
                ].map(({ key, label: wLabel, badge }) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedWeek(key); setOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors ${
                      selectedWeek === key ? 'bg-green-50' : ''
                    }`}
                  >
                    <span className={`text-sm font-medium ${selectedWeek === key ? 'text-green-600' : 'text-gray-700'}`}>
                      {wLabel}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedWeek === key ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`${baseClass} px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Claude denkt nach...
            </>
          ) : (
            <>
              <span>✨</span>
              {label}
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 text-right max-w-sm">{error}</p>
      )}
    </div>
  )
}
