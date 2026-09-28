/** Looks through every `<script type="application/ld+json">` block for one
 * whose `@type` is (or includes) "Recipe", handling both a bare object and
 * a `@graph` array — the two shapes recipe sites actually use. */
export function extractRecipeJsonLd(html: string): string | null {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of scripts) {
    let parsed: unknown
    try {
      parsed = JSON.parse(match[1])
    } catch {
      continue
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed]
    for (const candidate of candidates) {
      const node = findRecipeNode(candidate)
      if (node) return JSON.stringify(node)
    }
  }
  return null
}

function findRecipeNode(node: unknown): unknown | null {
  if (!node || typeof node !== 'object') return null
  const obj = node as Record<string, unknown>
  const type = obj['@type']
  const isRecipe = type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))
  if (isRecipe) return obj
  if (Array.isArray(obj['@graph'])) {
    for (const child of obj['@graph'] as unknown[]) {
      const found = findRecipeNode(child)
      if (found) return found
    }
  }
  return null
}
