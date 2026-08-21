import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suggestMeals, type Meal } from './api'
import { listPantryItems, consumeItem } from '@/features/pantry/api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { matchUsedIngredients } from '@/domain/matchIngredients'
import type { Language } from '@/shared/i18n'

export function useSuggestions(householdId: string) {
  const queryClient = useQueryClient()

  const suggest = useMutation({
    mutationFn: ({ regenerate, lang }: { regenerate: boolean; lang: Language }) =>
      suggestMeals(householdId, lang, regenerate),
  })

  const cookedThis = useMutation({
    mutationFn: async (meal: Meal) => {
      const pantry = await listPantryItems(householdId)
      const matchedIds = matchUsedIngredients(pantry, meal.uses)
      await Promise.all(matchedIds.map((id) => consumeItem(id)))
      return matchedIds.length
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) }),
  })

  return { suggest, cookedThis }
}
