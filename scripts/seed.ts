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

const items: { name: string; details: string | null }[] = [
  { name: 'Chicken breast', details: '500g' },
  { name: 'עגבניות', details: '6' },
  { name: 'Milk', details: '1L' },
  { name: 'ביצים', details: '12' },
  { name: 'Rice', details: '1kg' },
  { name: 'מלפפון', details: '4' },
  { name: 'Onion', details: '3' },
  { name: 'שמן זית', details: null },
  { name: 'Garlic', details: '1 head' },
  { name: 'גבינה צהובה', details: '200g' },
  { name: 'Pasta', details: '500g' },
  { name: 'לחם', details: '1 loaf' },
  { name: 'Butter', details: '200g' },
  { name: 'תפוחי אדמה', details: '5' },
  { name: 'Bell pepper', details: '2' },
  { name: 'יוגורט', details: '4' },
  { name: 'Canned tomatoes', details: '2 cans' },
  { name: 'קמח', details: '1kg' },
  { name: 'Lemon', details: '3' },
  { name: 'תבלינים מעורבים', details: null },
]

async function main() {
  const rows = items.map((item) => ({
    household_id: householdId,
    name: item.name,
    details: item.details,
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
