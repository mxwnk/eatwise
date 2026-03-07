'use client'

/**
 * PlanCard – clickable card in the archive sidebar representing one generated week plan.
 * Highlighted green when selected or when it represents the current calendar week.
 */
import { PlanMeta } from '@/lib/types'

interface PlanCardProps {
  meta: PlanMeta
  /** Whether this card is the currently displayed plan. */
  isSelected: boolean
  /** Whether this card represents the current calendar week. */
  isCurrent: boolean
  onClick: () => void
}

/** Splits a week key into display parts. "KW10_2026" → { kw: "KW 10", year: "2026" } */
function formatKW(week: string): { kw: string; year: string } {
  const match = week.match(/KW(\d+)_(\d+)/)
  if (!match) return { kw: week, year: '' }
  return { kw: `KW ${match[1]}`, year: match[2] }
}

export default function PlanCard({ meta, isSelected, isCurrent, onClick }: PlanCardProps) {
  const { kw, year } = formatKW(meta.week)
  const date = new Date(meta.generatedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : isCurrent
          ? 'border-green-200 bg-white hover:border-green-400 hover:shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-bold text-lg ${isSelected || isCurrent ? 'text-green-600' : 'text-gray-700'}`}>
              {kw}
            </span>
            <span className="text-sm text-gray-400">{year}</span>
            {isCurrent && (
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                Aktuell
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Erstellt {date}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg ${
          isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {meta.dayCount} Tage
        </span>
      </div>
    </button>
  )
}
