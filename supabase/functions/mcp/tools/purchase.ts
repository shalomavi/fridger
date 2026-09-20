import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { admin } from '../auth.ts'
import { isSameIngredient, mergeQuantity, mergeDetails, purchaseItem, type Unit } from '../domain.ts'

/** Mirrors src/features/shopping/purchase.ts's markPurchased with the admin
 * client instead of the user-session client — same merge-into-an-existing-
 * pantry-row behavior, reimplemented rather than imported since the
 * orchestration itself isn't pure (see mcp-connector-plan.md's note on why
 * only the decision-logic helpers are shared). */
export function registerPurchaseTool(server: McpServer, householdId: string) {
  server.registerTool(
    'mark_item_purchased',
    {
      description:
        'Mark a pending shopping-list item as purchased, moving it into the pantry (merging into an existing pantry row for the same ingredient when units are compatible)',
      inputSchema: z.object({ itemId: z.string().uuid() }),
    },
    async ({ itemId }: { itemId: string }) => {
      const { data: item, error: itemError } = await admin
        .from('shopping_items')
        .select('id, household_id, name, details, category, quantity, unit')
        .eq('id', itemId)
        .eq('household_id', householdId)
        .single()
      if (itemError || !item) throw new Error('Shopping item not found')

      const { data: available } = await admin
        .from('pantry_items')
        .select('id, name, details, quantity, unit')
        .eq('household_id', householdId)
        .eq('status', 'available')
      const match = (available ?? []).find((p) => isSameIngredient(p.name, item.name))
      const merged =
        match &&
        mergeQuantity({ quantity: match.quantity, unit: match.unit as Unit }, { quantity: item.quantity, unit: item.unit })

      if (match && merged) {
        const { error } = await admin
          .from('pantry_items')
          .update({ details: mergeDetails(match.details, item.details), quantity: merged.quantity, unit: merged.unit })
          .eq('id', match.id)
        if (error) throw new Error('Could not update pantry')
      } else {
        const { error } = await admin.from('pantry_items').insert(purchaseItem(item))
        if (error) throw new Error('Could not add to pantry')
      }

      const { error } = await admin
        .from('shopping_items')
        .update({ status: 'purchased', purchased_at: new Date().toISOString() })
        .eq('id', itemId)
      if (error) throw new Error('Could not mark item purchased')

      return { content: [{ type: 'text', text: 'Marked purchased' }] }
    },
  )
}
