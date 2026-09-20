// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import '@supabase/functions-js/edge-runtime.d.ts'
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { verifyBearerToken } from './auth.ts'
import { handleCreateToken } from './tokens.ts'
import { registerShoppingListTools } from './tools/shoppingList.ts'
import { registerPurchaseTool } from './tools/purchase.ts'
import { registerPantryTools } from './tools/pantry.ts'

// Only /mcp/tokens is browser-called (from the Fridger app's Settings
// screen), so only that route needs CORS — Claude's servers call /mcp
// directly, not from a page origin.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Fresh McpServer per request, scoped to the caller's household from their
// verified bearer token — see mcp-connector-plan.md §2 and auth.ts.
const mcpHandler = createMcpHandler(({ authInfo }) => {
  const server = new McpServer({ name: 'fridger', version: '0.1.0' })
  const householdId = (authInfo as { householdId: string }).householdId

  registerShoppingListTools(server, householdId)
  registerPurchaseTool(server, householdId)
  registerPantryTools(server, householdId)

  return server
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const url = new URL(req.url)
  if (url.pathname.endsWith('/tokens')) {
    return handleCreateToken(req, CORS_HEADERS)
  }

  const auth = await verifyBearerToken(req)
  if (!auth) return new Response('Unauthorized', { status: 401 })

  return mcpHandler.fetch(req, { authInfo: auth })
})
