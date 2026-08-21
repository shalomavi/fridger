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

const items: { name: string; amount: string | null }[] = [
  { name: 'Chicken breast', amount: '500g' },
  { name: 'עגבניות', amount: '6' },
  { name: 'Milk', amount: '1L' },
  { name: 'ביצים', amount: '12' },
  { name: 'Rice', amount: '1kg' },
  { name: 'מלפפון', amount: '4' },
  { name: 'Onion', amount: '3' },
  { name: 'שמן זית', amount: null },
  { name: 'Garlic', amount: '1 head' },
  { name: 'גבינה צהובה', amount: '200g' },
  { name: 'Pasta', amount: '500g' },
  { name: 'לחם', amount: '1 loaf' },
  { name: 'Butter', amount: '200g' },
  { name: 'תפוחי אדמה', amount: '5' },
  { name: 'Bell pepper', amount: '2' },
  { name: 'יוגורט', amount: '4' },
  { name: 'Canned tomatoes', amount: '2 cans' },
  { name: 'קמח', amount: '1kg' },
  { name: 'Lemon', amount: '3' },
  { name: 'תבלינים מעורבים', amount: null },
]

async function main() {
  const rows = items.map((item) => ({
    household_id: householdId,
    name: item.name,
    amount: item.amount,
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
