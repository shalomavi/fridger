import { useLanguage } from '@/features/household/useLanguage'
import { Surface } from '@/shared/ui/Surface'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton h-3 rounded ${className}`} />
}

/** Loading placeholder shaped like a meal suggestion / recipe card: a
 * title, a few ingredient lines, and an action button. The sweep animation
 * lives on the `.skeleton` class in index.css. */
export function SkeletonCard() {
  return (
    <Surface className="space-y-3 p-4" aria-hidden="true">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="space-y-2">
        <Bar className="w-full" />
        <Bar className="w-5/6" />
        <Bar className="w-4/6" />
      </div>
      <div className="skeleton h-8 w-28 rounded-md" />
    </Surface>
  )
}

export function SkeletonList({ count }: { count: number }) {
  const { t } = useLanguage()
  return (
    <ul className="space-y-3" aria-busy="true" aria-label={t('loading')}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  )
}
