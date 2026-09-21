import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suggestMeals, type Meal, type SuggestResponse, type SuggestionMode } from './api'
import { listPantryItems, consumeItem, updatePantryItemQuantity } from '@/features/pantry/api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { listShoppingItems, addShoppingItem } from '@/features/shopping/api'
import { shoppingQueryKey } from '@/features/shopping/useShoppingList'
import { matchUsedIngredients } from '@/domain/matchIngredients'
import { filterMissingIngredients } from '@/domain/filterMissingIngredients'
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
      mode,
    }: {
      regenerate: boolean
      lang: Language
      preferences: string | null
      mealTypes: MealType[]
      mode: SuggestionMode
    }) => suggestMeals(householdId, lang, preferences, mealTypes, mode, regenerate),
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

  // "Add to shopping list" for a suggestion's missing ingredients: skips
  // anything already in the pantry or already pending on the shopping list,
  // adds the rest with the quantity/unit/category the suggestion gave.
  // Returns how many were actually added, so the caller can tell "added"
  // from "already had it all".
  const addMissingToShoppingList = useMutation({
    mutationFn: async (meal: Meal) => {
      const [pantry, shoppingItems] = await Promise.all([listPantryItems(householdId), listShoppingItems(householdId)])
      const tracked = [...pantry, ...shoppingItems.filter((i) => i.status === 'pending')]
      const toAdd = filterMissingIngredients(meal.missing, tracked)
      await Promise.all(
        toAdd.map((item) =>
          addShoppingItem(householdId, crypto.randomUUID(), item.name, undefined, item.category, item.quantity, item.unit),
        ),
      )
      return toAdd.length
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingQueryKey(householdId) }),
  })

  return { suggestion, suggest, cookedThis, addMissingToShoppingList }
}
