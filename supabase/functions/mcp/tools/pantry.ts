import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { admin } from '../auth.ts'
import { UNITS, CATEGORIES } from '../domain.ts'

export function registerPantryTools(server: McpServer, householdId: string) {
  server.registerTool(
    'get_pantry',
    {
      description: "List what's currently in this household's pantry, including expiry dates",
      inputSchema: z.object({}),
    },
    async () => {
      const { data, error } = await admin
        .from('pantry_items')
        .select('id, name, details, category, quantity, unit, expires_at')
        .eq('household_id', householdId)
        .eq('status', 'available')
        .order('added_at', { ascending: false })
      if (error) throw new Error('Could not read pantry')

      return { content: [{ type: 'text', text: JSON.stringify(data) }] }
    },
  )

  server.registerTool(
    'consume_pantry_item',
    {
      description: "Mark a pantry item as used up — it stops being listed as in the fridge, kept for history rather than deleted",
      inputSchema: z.object({ itemId: z.string().uuid() }),
    },
    async ({ itemId }: { itemId: string }) => {
      const { error } = await admin
        .from('pantry_items')
        .update({ status: 'consumed', consumed_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('household_id', householdId)
      if (error) throw new Error('Could not update pantry item')

      return { content: [{ type: 'text', text: 'Marked consumed' }] }
    },
  )

  server.registerTool(
    'update_pantry_item',
    {
      description:
        'Edit fields on an existing pantry item. Only the fields provided are changed; pass category as null to clear it.',
      inputSchema: z.object({
        itemId: z.string().uuid(),
        name: z.string().min(1).optional(),
        details: z.string().nullable().optional(),
        category: z.enum(CATEGORIES).nullable().optional(),
        quantity: z.number().positive().optional(),
        unit: z.enum(UNITS).optional(),
      }),
    },
    async ({ itemId, name, details, category, quantity, unit }) => {
      const updates: Record<string, unknown> = {}
      if (name !== undefined) updates.name = name.trim()
      if (details !== undefined) updates.details = details?.trim() || null
      if (category !== undefined) updates.category = category
      if (quantity !== undefined) updates.quantity = quantity
      if (unit !== undefined) updates.unit = unit
      if (Object.keys(updates).length === 0) throw new Error('No fields to update')

      const { error } = await admin
        .from('pantry_items')
        .update(updates)
        .eq('id', itemId)
        .eq('household_id', householdId)
      if (error) throw new Error('Could not update pantry item')

      return { content: [{ type: 'text', text: 'Updated' }] }
    },
  )
}
