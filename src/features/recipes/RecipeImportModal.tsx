import type { RecipeIngredient } from './api'
import { formatQuantity } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'

/**
 * Preview of a just-parsed recipe (import or, later, other non-suggestion
 * sources) with the three-way destination choice the plan calls for: save
 * to Recipes, add to the shopping list, or both. Same overlay shell as
 * ConfirmDialog/ImportTextSheet.
 */
export function RecipeImportModal({
  recipe,
  onClose,
  onSaveToRecipes,
  onAddToShopping,
  onBoth,
  busy,
}: {
  recipe: { name: string; ingredients: RecipeIngredient[]; steps: string[] }
  onClose: () => void
  onSaveToRecipes: () => void
  onAddToShopping: () => void
  onBoth: () => void
  busy: boolean
}) {
  const { t, lang } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/5 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className={`animate-toast-in flex w-full max-w-sm flex-col gap-3 rounded-lg bg-surface/70 p-4 shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg ${
          lang === 'he' ? 'font-ui-he' : 'font-ui-en'
        }`}
      >
        <h3 className="text-lg font-medium text-primary-accent">{recipe.name}</h3>

        <div className="max-h-64 space-y-3 overflow-y-auto">
          {recipe.ingredients.length > 0 && (
            <p className="text-sm text-text-muted">
              <span className="text-text-subtle">{t('ingredientsLabel')} </span>
              {recipe.ingredients
                .map((i) => `${i.name} ${formatQuantity(i.quantity, i.unit, t(`unit_${i.unit}`))}`)
                .join(', ')}
            </p>
          )}
          <ol className="list-decimal space-y-1 ps-4 text-sm text-text-soft">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <p className="text-sm text-text-subtle">{t('importRecipeChooseDestination')}</p>

        <div className="flex flex-col gap-2">
          <Button onClick={onSaveToRecipes} disabled={busy} className="w-full py-2 text-sm">
            {t('importRecipeSaveOnly')}
          </Button>
          <Button variant="surface" onClick={onAddToShopping} disabled={busy} className="w-full py-2 text-sm">
            {t('importRecipeShoppingOnly')}
          </Button>
          <Button variant="secondary" onClick={onBoth} disabled={busy} className="w-full py-2 text-sm">
            {t('importRecipeBoth')}
          </Button>
          <button
            onClick={onClose}
            disabled={busy}
            className="mt-1 text-sm text-text-subtle underline disabled:opacity-50"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
