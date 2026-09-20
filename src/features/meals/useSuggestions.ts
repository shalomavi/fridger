import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suggestMeals, type Meal, type SuggestResponse } from './api'
import { listPantryItems, consumeItem, updatePantryItemQuantity } from '@/features/pantry/api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { matchUsedIngredients } from '@/domain/matchIngredients'
import type { Language } from '@/shared/i18n'
import type { MealType } from '@/shared/mealTypes'

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
      mealTypes,
    }: {
      regenerate: boolean
      lang: Language
      preferences: string | null
      mealTypes: MealType[]
    }) => suggestMeals(householdId, lang, preferences, mealTypes, regenerate),
    onSuccess: (data) => queryClient.setQueryData(key, data),
  })

  const cookedThis = useMutation({
    mutationFn: async (meal: Meal) => {
      const pantry = await listPantryItems(householdId)
      const matches = matchUsedIngredients(pantry, meal.uses)
      await Promise.all(
        matches.map(({ id, remainingQuantity, unit }) =>
          remainingQuantity > 0 ? updatePantryItemQuantity(id, remainingQuantity, unit) : consumeItem(id),
        ),
      )
      return matches.length
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) }),
  })

  return { suggestion, suggest, cookedThis }
}
