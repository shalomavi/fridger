import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { admin } from '../auth.ts'
import { isSameIngredient, mergeQuantity, mergeDetails, UNITS, type Unit } from '../domain.ts'

export function registerShoppingListTools(server: McpServer, householdId: string) {
  server.registerTool(
    'get_shopping_list',
    {
      description: "List this household's shopping list (pending and purchased items)",
      inputSchema: z.object({}),
    },
    async () => {
      const { data, error } = await admin
        .from('shopping_items')
        .select('id, name, details, category, quantity, unit, status')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (error) throw new Error('Could not read shopping list')

      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.registerTool(
    'add_shopping_item',
    {
      description:
        'Add an item to the shopping list. Merges into an existing pending item with the same name and a compatible unit instead of adding a duplicate.',
      inputSchema: z.object({
        name: z.string().min(1),
        details: z.string().optional(),
        quantity: z.number().positive().default(1),
        unit: z.enum(UNITS).default('count'),
      }),
    },
    async ({ name, details, quantity, unit }: { name: string; details?: string; quantity: number; unit: Unit }) => {
      const { data: pending } = await admin
        .from('shopping_items')
        .select('id, name, details, quantity, unit')
        .eq('household_id', householdId)
        .eq('status', 'pending')
      const match = (pending ?? []).find((i) => isSameIngredient(i.name, name))
      const merged =
        match && mergeQuantity({ quantity: match.quantity, unit: match.unit as Unit }, { quantity, unit })

      if (match && merged) {
        const { error } = await admin
          .from('shopping_items')
          .update({ details: mergeDetails(match.details, details ?? null), quantity: merged.quantity, unit: merged.unit })
          .eq('id', match.id)
        if (error) throw new Error('Could not update shopping item')
      } else {
        const { error } = await admin.from('shopping_items').insert({
          household_id: householdId,
          name: name.trim(),
          details: details?.trim() || null,
          quantity,
          unit,
        })
        if (error) throw new Error('Could not add shopping item')
      }

      return { content: [{ type: 'text', text: 'Added' }] }
    },
  )
}
