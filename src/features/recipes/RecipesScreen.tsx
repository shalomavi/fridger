import { useState } from 'react'
import { useRecipes } from './useRecipes'
import { RecipeCard } from './RecipeCard'
import { useAddIngredientsToShopping } from './useAddIngredientsToShopping'
import { ImportRecipeSheet } from './ImportRecipeSheet'
import { RecipeImportModal } from './RecipeImportModal'
import type { ParsedRecipe, RecipeIngredient, RecipeSource } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { ScrollToTopButton } from '@/shared/ui/ScrollToTopButton'

type ImportedRecipe = (ParsedRecipe & { isRecipe: true }) & { source: RecipeSource }

export function RecipesScreen({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: recipes, isLoading, save, remove } = useRecipes(householdId)
  const addIngredientsToShopping = useAddIngredientsToShopping(householdId)
  const { notify } = useToast()
  const [addingId, setAddingId] = useState<string | null>(null)
  const [importSheetOpen, setImportSheetOpen] = useState(false)
  const [imported, setImported] = useState<ImportedRecipe | null>(null)
  const [applying, setApplying] = useState(false)

  function onAddMissing(recipeId: string, ingredients: RecipeIngredient[]) {
    setAddingId(recipeId)
    addIngredientsToShopping.mutate(ingredients, {
      onSuccess: (addedCount) =>
        notify(addedCount > 0 ? t('addedMissingToShoppingList') : t('missingAlreadyTracked'), 'success'),
      onError: () => notify(t('actionFailed'), 'error'),
      onSettled: () => setAddingId(null),
    })
  }

  // The three-way destination choice from the import preview modal — save,
  // add to shopping, or both, run one after another (not Promise.all) so a
  // "both" failure on one half doesn't race the toast for the other.
  async function applyImport(destinations: { toRecipes: boolean; toShopping: boolean }) {
    if (!imported) return
    setApplying(true)
    try {
      if (destinations.toRecipes) {
        await save.mutateAsync({
          name: imported.name,
          ingredients: imported.ingredients,
          steps: imported.steps,
          source: imported.source,
        })
      }
      if (destinations.toShopping) {
        const addedCount = await addIngredientsToShopping.mutateAsync(imported.ingredients)
        notify(addedCount > 0 ? t('addedMissingToShoppingList') : t('missingAlreadyTracked'), 'success')
      }
      setImported(null)
    } catch {
      notify(t('actionFailed'), 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setImportSheetOpen(true)} className="w-full py-3">
        {t('importRecipe')}
      </Button>

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

      {importSheetOpen && (
        <ImportRecipeSheet
          householdId={householdId}
          onClose={() => setImportSheetOpen(false)}
          onParsed={(recipe, source) => {
            setImportSheetOpen(false)
            setImported({ ...recipe, source })
          }}
        />
      )}

      {imported && (
        <RecipeImportModal
          recipe={imported}
          busy={applying}
          onClose={() => setImported(null)}
          onSaveToRecipes={() => applyImport({ toRecipes: true, toShopping: false })}
          onAddToShopping={() => applyImport({ toRecipes: false, toShopping: true })}
          onBoth={() => applyImport({ toRecipes: true, toShopping: true })}
        />
      )}
    </div>
  )
}
