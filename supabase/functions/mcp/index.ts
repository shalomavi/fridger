// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import '@supabase/functions-js/edge-runtime.d.ts'
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { verifyBearerToken } from './auth.ts'
import { handleCreateToken } from './tokens.ts'
import { registerShoppingListTools } from './tools/shoppingList.ts'
import { registerPurchaseTool } from './tools/purchase.ts'
import { registerPantryTools } from './tools/pantry.ts'
import { authorizationServerMetadata, protectedResourceMetadata } from './oauth/metadata.ts'
import { handleRegister, handleClientInfo } from './oauth/register.ts'
import { handleAuthorizeRequest, handleAuthorizeApprove } from './oauth/authorize.ts'
import { handleToken } from './oauth/token.ts'
import { handleListConnections, handleRevokeConnection } from './oauth/connections.ts'

// /tokens, /oauth/*, and /authorize/approve are browser-called (from the
// Fridger app's Settings/consent screens); Claude/Gemini's servers call
// /mcp, /authorize, /token, /register directly, not from a page origin —
// harmless to send CORS headers on those too.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  // WWW-Authenticate isn't on the browser's CORS-safelisted response
  // headers by default — without this, a client checking auth support via
  // an in-browser fetch() can't actually read the header we send it.
  'Access-Control-Expose-Headers': 'WWW-Authenticate',
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
  const path = url.pathname
  // req.url's scheme reflects the internal proxy hop (http), not the public
  // HTTPS edge Cloudflare terminates at — every absolute URL we hand back
  // to a client (discovery docs, WWW-Authenticate) must force https or an
  // OAuth client trying to fetch it over plain http gets nothing and gives
  // up silently.
  const origin = `https://${url.host}`

  // Discovery documents live under the /mcp prefix (not at the domain
  // root's /.well-known/...) because Supabase routes Edge Function
  // requests by function-name prefix — a root-level path never reaches
  // this function at all.
  if (path.endsWith('/.well-known/oauth-authorization-server')) {
    return Response.json(authorizationServerMetadata(`${origin}/mcp`), { headers: CORS_HEADERS })
  }
  if (path.endsWith('/.well-known/oauth-protected-resource')) {
    return Response.json(protectedResourceMetadata(`${origin}/mcp`), { headers: CORS_HEADERS })
  }
  if (path.endsWith('/register')) return handleRegister(req, CORS_HEADERS)
  if (path.endsWith('/oauth/client')) return handleClientInfo(req, CORS_HEADERS)
  if (path.endsWith('/authorize/approve')) return handleAuthorizeApprove(req, CORS_HEADERS)
  if (path.endsWith('/authorize')) return handleAuthorizeRequest(req)
  if (path.endsWith('/token')) return handleToken(req, CORS_HEADERS)
  if (path.endsWith('/oauth/connections/revoke')) return handleRevokeConnection(req, CORS_HEADERS)
  if (path.endsWith('/oauth/connections')) return handleListConnections(req, CORS_HEADERS)
  if (path.endsWith('/tokens')) return handleCreateToken(req, CORS_HEADERS)

  const auth = await verifyBearerToken(req)
  if (!auth) {
    // Per the MCP auth spec, an unauthenticated/bad-token request to the
    // resource must point the client at the protected-resource metadata
    // doc via WWW-Authenticate, or an OAuth client (Gemini) has no way to
    // discover /register, /authorize, /token and just reports the server
    // as using an unsupported auth method — it never gets far enough to
    // try DCR at all.
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        ...CORS_HEADERS,
        'WWW-Authenticate': `Bearer resource_metadata="${origin}/mcp/.well-known/oauth-protected-resource"`,
      },
    })
  }

  return mcpHandler.fetch(req, { authInfo: auth })
})
