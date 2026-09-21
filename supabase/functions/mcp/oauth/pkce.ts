/** RFC 7636 S256 PKCE check — the only method this server accepts (OAuth
 * 2.1 drops the "plain" method). code_challenge is base64url(sha256(verifier)). */
export async function verifyPkce(codeVerifier: string, codeChallenge: string): Promise<boolean> {
  const bytes = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const computed = base64UrlEncode(new Uint8Array(digest))
  return computed === codeChallenge
}

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
