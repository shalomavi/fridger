import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { admin } from '../auth.ts'
import { UNITS, CATEGORIES } from '../domain.ts'

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit: z.enum(UNITS).default('count'),
  category: z.enum(CATEGORIES).default('other'),
})

const stepsSchema = z.array(z.string().min(1))

function cleanIngredients(list: z.infer<typeof ingredientSchema>[]) {
  return list.map((i) => ({ ...i, name: i.name.trim() }))
}

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value }] }
}

export function registerRecipeTools(server: McpServer, householdId: string) {
  server.registerTool(
    'get_recipes',
    {
      description: "List this household's saved recipes with their ingredients and steps",
      inputSchema: z.object({}),
    },
    async () => {
      const { data, error } = await admin
        .from('recipes')
        .select('id, name, ingredients, steps, source, source_url, created_at')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
      if (error) throw new Error('Could not read recipes')

      return text(JSON.stringify(data))
    },
  )

  server.registerTool(
    'add_recipe',
    {
      description: 'Save a new recipe to the household recipe list',
      inputSchema: z.object({
        name: z.string().min(1),
        ingredients: z.array(ingredientSchema),
        steps: stepsSchema,
        sourceUrl: z.string().url().optional(),
      }),
    },
    async ({ name, ingredients, steps, sourceUrl }) => {
      const { data, error } = await admin
        .from('recipes')
        .insert({
          household_id: householdId,
          name: name.trim(),
          ingredients: cleanIngredients(ingredients),
          steps,
          source: sourceUrl ? 'url' : 'text',
          source_url: sourceUrl ?? null,
        })
        .select('id')
        .single()
      if (error) throw new Error('Could not add recipe')

      return text(JSON.stringify({ id: data.id }))
    },
  )

  server.registerTool(
    'update_recipe',
    {
      description:
        'Edit an existing recipe. Only the fields provided are changed; ingredients and steps, when given, replace the whole list.',
      inputSchema: z.object({
        recipeId: z.string().uuid(),
        name: z.string().min(1).optional(),
        ingredients: z.array(ingredientSchema).optional(),
        steps: stepsSchema.optional(),
      }),
    },
    async ({ recipeId, name, ingredients, steps }) => {
      const updates: Record<string, unknown> = {}
      if (name !== undefined) updates.name = name.trim()
      if (ingredients !== undefined) updates.ingredients = cleanIngredients(ingredients)
      if (steps !== undefined) updates.steps = steps
      if (Object.keys(updates).length === 0) throw new Error('No fields to update')

      const { data, error } = await admin
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)
        .eq('household_id', householdId)
        .select('id')
      if (error) throw new Error('Could not update recipe')
      if (data.length === 0) throw new Error('Recipe not found')

      return text('Updated')
    },
  )

  server.registerTool(
    'delete_recipe',
    {
      description: 'Permanently delete a recipe from the household recipe list',
      inputSchema: z.object({ recipeId: z.string().uuid() }),
    },
    async ({ recipeId }) => {
      const { data, error } = await admin
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('household_id', householdId)
        .select('id')
      if (error) throw new Error('Could not delete recipe')
      if (data.length === 0) throw new Error('Recipe not found')

      return text('Deleted')
    },
  )
}
