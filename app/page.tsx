'use client'

import { useEffect, useState, useCallback } from 'react'
import { WeekPlan as WeekPlanType, FamilyContext } from '@/lib/types'
import { PlanMeta } from '@/lib/types'
import { getCurrentWeekKey, getWeekLabel } from '@/lib/getWeekNumber'
import WeekPlan from '@/components/WeekPlan'
import PlanCard from '@/components/PlanCard'
import GenerateButton from '@/components/GenerateButton'

export default function Home() {
  const [context, setContext] = useState<FamilyContext | null>(null)
  const [planList, setPlanList] = useState<PlanMeta[]>([])
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekKey())
  const [loadedPlans, setLoadedPlans] = useState<Record<string, WeekPlanType>>({})
  const [loading, setLoading] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(false)

  const currentWeek = getCurrentWeekKey()

  useEffect(() => {
    Promise.all([
      fetch('/api/context').then((r) => r.json()),
      fetch('/api/plans').then((r) => r.json()),
    ]).then(([ctx, list]) => {
      setContext(ctx)
      setPlanList(list)
      setLoading(false)
    })
  }, [])

  const loadPlan = useCallback(async (week: string) => {
    if (loadedPlans[week]) return
    setLoadingPlan(true)
    const res = await fetch(`/api/plan?week=${week}`)
    if (res.ok) {
      const plan = await res.json()
      setLoadedPlans((p) => ({ ...p, [week]: plan }))
    }
    setLoadingPlan(false)
  }, [loadedPlans])

  useEffect(() => {
    loadPlan(selectedWeek)
  }, [selectedWeek, loadPlan])

  const handlePlanGenerated = (plan: WeekPlanType) => {
    setLoadedPlans((p) => ({ ...p, [plan.week]: plan }))
    setSelectedWeek(plan.week)
    setPlanList((list) => {
      const meta: PlanMeta = {
        week: plan.week,
        generatedAt: plan.generatedAt,
        dayCount: plan.days.length,
      }
      const exists = list.some((m) => m.week === plan.week)
      return exists
        ? list.map((m) => (m.week === plan.week ? meta : m))
        : [meta, ...list]
    })
  }

  const selectedPlan = loadedPlans[selectedWeek]
  const currentPlanExists = planList.some((m) => m.week === currentWeek)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mahlzeitenplan</h1>
          <p className="text-gray-500 text-sm">{getWeekLabel()}</p>
        </div>
        {context && (
          <GenerateButton
            onPlanGenerated={handlePlanGenerated}
            label={currentPlanExists ? 'Plan neu generieren' : 'Plan generieren'}
            variant={currentPlanExists ? 'secondary' : 'primary'}
          />
        )}
      </div>

      {planList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
          <div className="text-6xl">🥗</div>
          <h2 className="text-xl font-semibold text-gray-700">Noch kein Plan vorhanden</h2>
          <p className="text-gray-500 max-w-sm">
            Klicke auf „Plan generieren", um mit Claude einen personalisierten
            Wochenmahlzeitenplan für deine Familie zu erstellen.
          </p>
          {context && (
            <GenerateButton onPlanGenerated={handlePlanGenerated} label="Jetzt Plan generieren" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <aside className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
              Alle Pläne ({planList.length})
            </p>
            {planList.map((meta) => (
              <PlanCard
                key={meta.week}
                meta={meta}
                isSelected={meta.week === selectedWeek}
                isCurrent={meta.week === currentWeek}
                onClick={() => setSelectedWeek(meta.week)}
              />
            ))}
          </aside>

          {/* Main */}
          <main>
            {loadingPlan ? (
              <div className="flex items-center justify-center min-h-[30vh]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedPlan && context ? (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-700">
                  {selectedWeek === currentWeek ? 'Aktuelle Woche – ' : 'Archiv – '}
                  <span className="text-green-600">
                    {selectedWeek.replace(/KW(\d+)_(\d+)/, 'KW $1 / $2')}
                  </span>
                </h2>
                <WeekPlan plan={selectedPlan} context={context} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-3 bg-white rounded-xl border border-gray-200 p-8">
                <p className="text-gray-500">Kein Plan für diese Woche gefunden.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
