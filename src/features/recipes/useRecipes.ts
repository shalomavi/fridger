import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listRecipes, addRecipe, deleteRecipe, type Recipe, type RecipeIngredient, type RecipeSource } from './api'
import { useToast } from '@/shared/alerts/ToastContext'
import { useLanguage } from '@/features/household/useLanguage'

export const recipesQueryKey = (householdId: string) => ['recipes', householdId] as const

export function useRecipes(householdId: string) {
  const queryClient = useQueryClient()
  const key = recipesQueryKey(householdId)
  const { t } = useLanguage()
  const { notify } = useToast()

  const query = useQuery({ queryKey: key, queryFn: () => listRecipes(householdId) })

  const save = useMutation({
    mutationFn: ({
      name,
      ingredients,
      steps,
      source,
      sourceUrl,
    }: {
      name: string
      ingredients: RecipeIngredient[]
      steps: string[]
      source: RecipeSource
      sourceUrl?: string
    }) => addRecipe(householdId, crypto.randomUUID(), name, ingredients, steps, source, sourceUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: () => notify(t('actionFailed'), 'error'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Recipe[]>(key)
      queryClient.setQueryData<Recipe[]>(key, (recipes) => recipes?.filter((r) => r.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      notify(t('actionFailed'), 'error')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, save, remove }
}
