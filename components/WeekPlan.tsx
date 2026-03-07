'use client'

/**
 * WeekPlan – renders all 7 days of a generated plan.
 * Days are sorted Mon–Sun regardless of the order returned by the API.
 * Today's DayCard is highlighted and auto-expanded.
 */
import { WeekPlan as WeekPlanType, FamilyContext } from '@/lib/types'
import DayCard from './DayCard'

interface WeekPlanProps {
  plan: WeekPlanType
  context: FamilyContext
}

/** Canonical Mon–Sun order used for sorting plan days. */
const GERMAN_DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

/** Returns the German name of today's weekday to match against plan day labels. */
function getTodayGerman(): string {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  return days[new Date().getDay()]
}

export default function WeekPlan({ plan, context }: WeekPlanProps) {
  const today = getTodayGerman()

  const sortedDays = [...plan.days].sort(
    (a, b) => GERMAN_DAYS.indexOf(a.day) - GERMAN_DAYS.indexOf(b.day)
  )

  const generatedDate = new Date(plan.generatedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      <section>
        <div className="space-y-3">
          {sortedDays.map((day, i) => (
            <DayCard
              key={i}
              day={day}
              context={context}
              isToday={day.day === today}
            />
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center">
        Generiert am {generatedDate}
      </p>
    </div>
  )
}
