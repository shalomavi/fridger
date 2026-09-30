import type { Recipe, RecipeSource } from './api'
import { shareRecipeToWhatsApp } from './shareRecipe'
import { formatQuantity } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { Surface } from '@/shared/ui/Surface'
import { Button } from '@/shared/ui/Button'
import { DeleteButton } from '@/features/shopping/DeleteButton'
import { SparklesIcon, NotesIcon, ImageIcon, LinkIcon } from '@/shared/ui/FormIcons'

// One small icon per import source, so a card reads at a glance where it
// came from without spelling it out in text every time.
const SOURCE_ICON: Record<RecipeSource, (props: { className?: string }) => React.JSX.Element> = {
  suggestion: SparklesIcon,
  text: NotesIcon,
  image: ImageIcon,
  url: LinkIcon,
}

export function RecipeCard({
  recipe,
  onAddMissing,
  addingMissing,
  onDelete,
}: {
  recipe: Recipe
  onAddMissing: () => void
  addingMissing: boolean
  onDelete: () => void
}) {
  const { t, lang } = useLanguage()
  const SourceIcon = SOURCE_ICON[recipe.source]

  return (
    <Surface as="li" className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-medium text-primary-accent">
          <SourceIcon className="me-1 inline h-[1em] w-[1em] align-[-0.15em] text-surface-muted" />
          {recipe.name}
        </h3>
        <DeleteButton onDelete={onDelete} label={t('deleteItem')} confirmMessage={t('confirmDeleteItem')} />
      </div>

      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs text-text-subtle underline"
        >
          {recipe.source_url}
        </a>
      )}

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

      <div className="flex gap-2">
        <Button
          variant="surface"
          onClick={() => shareRecipeToWhatsApp(recipe, lang)}
          className="flex-1 py-2 text-sm"
        >
          {t('shareMeal')}
        </Button>
        <Button onClick={onAddMissing} disabled={addingMissing} className="flex-1 py-2 text-sm">
          {addingMissing ? '…' : t('addMissingToShoppingList')}
        </Button>
      </div>
    </Surface>
  )
}
