import { useState } from 'react'
import { useRecipes } from './useRecipes'
import { RecipeCard } from './RecipeCard'
import { useAddIngredientsToShopping } from './useAddIngredientsToShopping'
import type { RecipeIngredient } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { ScrollToTopButton } from '@/shared/ui/ScrollToTopButton'

export function RecipesScreen({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: recipes, isLoading, remove } = useRecipes(householdId)
  const addIngredientsToShopping = useAddIngredientsToShopping(householdId)
  const { notify } = useToast()
  const [addingId, setAddingId] = useState<string | null>(null)

  function onAddMissing(recipeId: string, ingredients: RecipeIngredient[]) {
    setAddingId(recipeId)
    addIngredientsToShopping.mutate(ingredients, {
      onSuccess: (addedCount) =>
        notify(addedCount > 0 ? t('addedMissingToShoppingList') : t('missingAlreadyTracked'), 'success'),
      onError: () => notify(t('actionFailed'), 'error'),
      onSettled: () => setAddingId(null),
    })
  }

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-text-subtle">{t('loading')}</p>}

      {!isLoading && (!recipes || recipes.length === 0) && (
        <p className="text-text-subtle">{t('recipesEmpty')}</p>
      )}

      {!isLoading && recipes && recipes.length > 0 && (
        <ul className="space-y-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddMissing={() => onAddMissing(recipe.id, recipe.ingredients)}
              addingMissing={addIngredientsToShopping.isPending && addingId === recipe.id}
              onDelete={() => remove.mutate(recipe.id)}
            />
          ))}
        </ul>
      )}

      <ScrollToTopButton label={t('scrollToTop')} />
    </div>
  )
}
