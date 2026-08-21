import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suggestMeals, type Meal, type SuggestResponse } from './api'
import { listPantryItems, consumeItem } from '@/features/pantry/api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { matchUsedIngredients } from '@/domain/matchIngredients'
import type { Language } from '@/shared/i18n'

const suggestionQueryKey = (householdId: string) => ['meal-suggestion', householdId] as const

export function useSuggestions(householdId: string) {
  const queryClient = useQueryClient()
  const key = suggestionQueryKey(householdId)

  // Not a real fetch — this slot only ever gets written by the mutation
  // below (setQueryData on success). Living in the query cache rather than
  // component state means it survives switching tabs, since the cache
  // outlives MealsScreen's mount/unmount; a plain useState here didn't.
  const suggestion = useQuery<SuggestResponse | null>({
    queryKey: key,
    queryFn: () => null,
    initialData: null,
    enabled: false,
  })

  const suggest = useMutation({
    mutationFn: ({
      regenerate,
      lang,
      preferences,
    }: {
      regenerate: boolean
      lang: Language
      preferences: string | null
    }) => suggestMeals(householdId, lang, preferences, regenerate),
    onSuccess: (data) => queryClient.setQueryData(key, data),
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

  return { suggestion, suggest, cookedThis }
}
