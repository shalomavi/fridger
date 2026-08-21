/**
 * Seeds a household with ~20 pantry items in mixed Hebrew/English, for use
 * during development of the meal-suggestion feature (slice 4+).
 *
 * Usage: npx tsx scripts/seed.ts <household_id>
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment —
 * never commit these, never run this against production data casually.
 */
import { createClient } from '@supabase/supabase-js'

const householdId = process.argv[2]
if (!householdId) {
  console.error('Usage: npx tsx scripts/seed.ts <household_id>')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const items: { name: string; quantity: number | null; unit: string | null }[] = [
  { name: 'Chicken breast', quantity: 500, unit: 'g' },
  { name: 'עגבניות', quantity: 6, unit: null },
  { name: 'Milk', quantity: 1, unit: 'L' },
  { name: 'ביצים', quantity: 12, unit: null },
  { name: 'Rice', quantity: 1, unit: 'kg' },
  { name: 'מלפפון', quantity: 4, unit: null },
  { name: 'Onion', quantity: 3, unit: null },
  { name: 'שמן זית', quantity: null, unit: null },
  { name: 'Garlic', quantity: 1, unit: 'head' },
  { name: 'גבינה צהובה', quantity: 200, unit: 'g' },
  { name: 'Pasta', quantity: 500, unit: 'g' },
  { name: 'לחם', quantity: 1, unit: 'loaf' },
  { name: 'Butter', quantity: 200, unit: 'g' },
  { name: 'תפוחי אדמה', quantity: 5, unit: null },
  { name: 'Bell pepper', quantity: 2, unit: null },
  { name: 'יוגורט', quantity: 4, unit: null },
  { name: 'Canned tomatoes', quantity: 2, unit: 'cans' },
  { name: 'קמח', quantity: 1, unit: 'kg' },
  { name: 'Lemon', quantity: 3, unit: null },
  { name: 'תבלינים מעורבים', quantity: null, unit: null },
]

async function main() {
  const rows = items.map((item) => ({
    household_id: householdId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    status: 'available' as const,
  }))

  const { error } = await supabase.from('pantry_items').insert(rows)
  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }
  console.log(`Seeded ${rows.length} pantry items for household ${householdId}.`)
}

main()
