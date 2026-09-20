import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { admin } from '../auth.ts'

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
}
