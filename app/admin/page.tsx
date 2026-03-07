'use client'

import { useEffect, useState } from 'react'
import { FamilyContext } from '@/lib/types'
import GenerateButton from '@/components/GenerateButton'

export default function AdminPage() {
  const [context, setContext] = useState<FamilyContext | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/context').then((r) => r.json()).then(setContext)
    fetch('/api/plan')
      .then((r) => (r.ok ? r.json() : null))
      .then((plan) => {
        if (plan?.generatedAt) {
          setLastGenerated(
            new Date(plan.generatedAt).toLocaleDateString('de-DE', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          )
        }
      })
  }, [])

  const handleSave = async () => {
    if (!context) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/context', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  const set = (field: keyof FamilyContext, value: string | number) =>
    setContext((c) => c ? { ...c, [field]: value } : c)

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          {lastGenerated && (
            <p className="text-xs text-gray-400">Letzter Plan: {lastGenerated}</p>
          )}
        </div>
        <GenerateButton
          onPlanGenerated={(plan) => {
            setLastGenerated(
              new Date(plan.generatedAt).toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            )
          }}
          label="Plan neu generieren"
          variant="secondary"
        />
      </div>

      {/* Global context */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Kontext</h2>
        <textarea
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-400"
          value={context.globalContext}
          onChange={(e) => set('globalContext', e.target.value)}
        />
      </section>

      {/* Family size */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Familiengröße</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Erwachsene</label>
            <input
              type="number" min={0} max={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={context.adults}
              onChange={(e) => set('adults', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kinder</label>
            <input
              type="number" min={0} max={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={context.children}
              onChange={(e) => set('children', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">kcal/Tag Erwachsene</label>
            <input
              type="number" min={500} max={5000} step={50}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={context.adultKcal}
              onChange={(e) => set('adultKcal', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">kcal/Tag Kinder</label>
            <input
              type="number" min={500} max={3000} step={50}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={context.childKcal}
              onChange={(e) => set('childKcal', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </section>

      {/* Diet & preferences */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Ernährung & Vorlieben</h2>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ernährungsweise</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={context.diet}
            onChange={(e) => set('diet', e.target.value)}
            placeholder="z.B. Ein Erwachsener Omnivore, ein Erwachsener Vegetarisch"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vorlieben</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={context.preferences}
            onChange={(e) => set('preferences', e.target.value)}
            placeholder="z.B. Schnelle Gerichte, international"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mag nicht / Unverträglichkeiten</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={context.dislikes}
            onChange={(e) => set('dislikes', e.target.value)}
            placeholder="z.B. Kein Fisch, keine scharfen Gewürze"
          />
        </div>
      </section>

      {/* Sticky save */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-green-600">✓ Gespeichert</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Speichern...</>
            ) : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
