'use client'

/**
 * DayCard – collapsible accordion for a single day.
 * Shows the total adult kcal in the header and renders a MealRow for each meal.
 * Today's card is auto-expanded and highlighted in green.
 */
import { DayPlan, FamilyContext } from '@/lib/types'
import MealRow from './MealRow'
import { useState } from 'react'

interface DayCardProps {
  day: DayPlan
  context: FamilyContext
  /** Whether this card represents the current calendar day. */
  isToday?: boolean
}

/** Short abbreviations shown in the day header. */
const DAY_NAMES: Record<string, string> = {
  Montag: 'Mo',
  Dienstag: 'Di',
  Mittwoch: 'Mi',
  Donnerstag: 'Do',
  Freitag: 'Fr',
  Samstag: 'Sa',
  Sonntag: 'So',
}

export default function DayCard({ day, context, isToday }: DayCardProps) {
  const [open, setOpen] = useState(isToday ?? false)

  const totalAdultKcal = day.meals.reduce((sum, meal) => sum + meal.adult.kcal, 0)

  return (
    <div className={`rounded-xl border ${isToday ? 'border-green-400 shadow-md' : 'border-gray-200'} bg-white overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left px-4 py-3 flex items-center justify-between ${isToday ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
            {DAY_NAMES[day.day] ?? day.day}
          </span>
          <span className={`font-medium ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
            {day.day}
          </span>
          {isToday && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
              Heute
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-gray-400">{totalAdultKcal} kcal / Erw.</span>
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-3 space-y-2">
          {day.meals.map((meal, i) => (
            <MealRow key={i} meal={meal} context={context} />
          ))}
        </div>
      )}
    </div>
  )
}
