/** RFC 8414 authorization server metadata + the MCP protected-resource
 * metadata document. `origin` is the function's own base URL (no trailing
 * slash), e.g. https://<project>.functions.supabase.co/mcp. */
export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
  }
}

export function protectedResourceMetadata(origin: string) {
  return {
    resource: origin,
    authorization_servers: [origin],
  }
}
