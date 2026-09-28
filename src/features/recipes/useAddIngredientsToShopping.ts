import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listPantryItems } from '@/features/pantry/api'
import { listShoppingItems, addShoppingItem } from '@/features/shopping/api'
import { shoppingQueryKey } from '@/features/shopping/useShoppingList'
import { filterMissingIngredients } from '@/domain/filterMissingIngredients'
import type { RecipeIngredient } from './api'

/**
 * "Add to shopping list" for a list of ingredients (a suggestion's missing
 * ones, or a saved recipe's full ingredient list): skips anything already
 * in the pantry or already pending on the shopping list, adds the rest with
 * the quantity/unit/category given. Returns how many were actually added,
 * so the caller can tell "added" from "already had it all".
 *
 * Shared by useSuggestions.ts and the recipes screen — same filtering logic
 * either way, just called with a different ingredient list.
 */
export function useAddIngredientsToShopping(householdId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ingredients: RecipeIngredient[]) => {
      const [pantry, shoppingItems] = await Promise.all([
        listPantryItems(householdId),
        listShoppingItems(householdId),
      ])
      const tracked = [...pantry, ...shoppingItems.filter((i) => i.status === 'pending')]
      const toAdd = filterMissingIngredients(ingredients, tracked)
      await Promise.all(
        toAdd.map((item) =>
          addShoppingItem(householdId, crypto.randomUUID(), item.name, undefined, item.category, item.quantity, item.unit),
        ),
      )
      return toAdd.length
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingQueryKey(householdId) }),
  })
}
