// Fetches a recipe page for link import (slice D). Only this file talks to
// the network for scraping — index.ts calls scrapeRecipePage and hands the
// result to gemini.ts/prompt.ts, same as the text/image inputs.

import { extractRecipeJsonLd } from './scrapeJsonLd.ts'

const FETCH_TIMEOUT_MS = 10_000
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024
const MAX_TEXT_LENGTH = 30_000
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

export type ScrapeResult = { kind: 'json-ld'; text: string } | { kind: 'text'; text: string }

/** Rejects anything that isn't a plain public http(s) host — no localhost,
 * loopback, or private IP literals — so the scraper can't be used to probe
 * internal network services (SSRF). This only catches IP literals and
 * common local hostnames, not DNS rebinding, which is an accepted gap for
 * this household-scale feature. */
export function assertSafeUrl(rawUrl: string): URL {
  const url = new URL(rawUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported')
  }
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '0.0.0.0') {
    throw new Error("That address isn't reachable")
  }
  if (isPrivateIpLiteral(hostname)) {
    throw new Error("That address isn't reachable")
  }
  return url
}

function isPrivateIpLiteral(hostname: string): boolean {
  if (hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc') || hostname.startsWith('fd')) {
    return true
  }
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4) return false
  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
  return (
    a === 127 ||
    a === 10 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/** Fetches the page and extracts recipe content: JSON-LD `@type: Recipe`
 * when present (small, clean input for the model), otherwise the page's
 * text with script/style/nav stripped, truncated to ~30k chars. Throws with
 * a user-facing message on any network failure, timeout, oversized
 * response, or non-HTML result. */
export async function scrapeRecipePage(rawUrl: string): Promise<ScrapeResult> {
  const url = assertSafeUrl(rawUrl)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    })
  } catch {
    throw new Error("Couldn't fetch that page")
  } finally {
    clearTimeout(timeout)
  }
  if (!res.ok || !res.body) throw new Error("Couldn't fetch that page")

  const html = await readCapped(res, MAX_RESPONSE_BYTES)

  const jsonLd = extractRecipeJsonLd(html)
  if (jsonLd) return { kind: 'json-ld', text: jsonLd }

  return { kind: 'text', text: stripToText(html).slice(0, MAX_TEXT_LENGTH) }
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body!.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      break
    }
    chunks.push(value)
  }
  const combined = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(combined)
}

function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
