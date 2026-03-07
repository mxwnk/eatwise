'use client'

/**
 * MealRow – displays a single meal in a collapsible row.
 *
 * Two tabs when expanded:
 *   "Rezept (1 Erw.)"  – ingredient list for exactly 1 adult, child variant shown alongside if different
 *   "Einkauf (nE + nK)" – same lists multiplied by the number of adults / children from context
 */
import { Meal, FamilyContext } from '@/lib/types'
import { useState } from 'react'

interface MealRowProps {
  meal: Meal
  context: FamilyContext
}

/** Maps German meal-type labels to display icons. */
const MEAL_ICONS: Record<string, string> = {
  'Frühstück': '🌅',
  'Mittagessen': '☀️',
  'Abendessen': '🌙',
  'Snack': '🍎',
}

/**
 * Scales all numeric values in an ingredient string by `factor`.
 * Example: "80g Haferflocken" × 2 → "160g Haferflocken"
 */
function multiplyIngredient(ingredient: string, factor: number): string {
  return ingredient.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const num = parseFloat(match.replace(',', '.'))
    return String(Math.round(num * factor))
  })
}

export default function MealRow({ meal, context }: MealRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showShopping, setShowShopping] = useState(false)

  const hasChildVariant = !!meal.child

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">{MEAL_ICONS[meal.type] ?? '🍽️'}</span>
            <div className="min-w-0">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block">
                {meal.type}
              </span>
              <p className="font-semibold text-gray-900 truncate">{meal.name}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{meal.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block">{meal.adult.kcal} kcal</span>
            {hasChildVariant && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Kind ↕</span>
            )}
            <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          {/* Tab toggle */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setShowShopping(false)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                !showShopping ? 'bg-white text-green-600 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Rezept (1 Erw.)
            </button>
            <button
              onClick={() => setShowShopping(true)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                showShopping ? 'bg-white text-green-600 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Einkauf ({context.adults}E{context.children > 0 ? ` + ${context.children}K` : ''})
            </button>
          </div>

          <div className="p-3 space-y-3">
            {!showShopping ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Adult recipe */}
                <div className="bg-white rounded-lg border border-blue-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600">1 Erwachsener</span>
                    <span className="text-xs text-gray-400">{meal.adult.kcal} kcal</span>
                  </div>
                  <ul className="space-y-0.5">
                    {meal.adult.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                        <span className="text-gray-300 flex-shrink-0">•</span>{ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Child recipe (only if different) */}
                {hasChildVariant && meal.child && (
                  <div className="bg-white rounded-lg border border-yellow-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-yellow-600">1 Kind</span>
                      <span className="text-xs text-gray-400">{meal.child.kcal} kcal</span>
                    </div>
                    {meal.child.note && (
                      <p className="text-xs italic text-gray-400 mb-1">{meal.child.note}</p>
                    )}
                    <ul className="space-y-0.5">
                      {meal.child.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-gray-300 flex-shrink-0">•</span>{ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Shopping: adults multiplied */}
                {context.adults > 0 && (
                  <div className="bg-white rounded-lg border border-blue-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600">
                        {context.adults} Erwachsene{context.adults === 1 ? 'r' : ''}
                      </span>
                      <span className="text-xs text-gray-400">
                        {meal.adult.kcal * context.adults} kcal
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {meal.adult.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-gray-300 flex-shrink-0">•</span>
                          {multiplyIngredient(ing, context.adults)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Shopping: children multiplied */}
                {context.children > 0 && (
                  <div className="bg-white rounded-lg border border-yellow-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-yellow-600">
                        {context.children} Kind{context.children > 1 ? 'er' : ''}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(meal.child?.kcal ?? meal.adult.kcal) * context.children} kcal
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {(meal.child?.ingredients ?? meal.adult.ingredients).map((ing, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-gray-300 flex-shrink-0">•</span>
                          {multiplyIngredient(ing, context.children)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
