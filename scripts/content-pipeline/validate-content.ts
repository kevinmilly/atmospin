import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ChallengeSchema = z.object({
  location: z.object({
    name: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    country: z.string().min(1),
    continent: z.string().min(1),
    type: z.enum(['city', 'landmark', 'region', 'body_of_water', 'other']),
  }),
  event: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    year_start: z.number().int(),
    era: z.string().min(1),
    tags: z.array(z.string()),
  }),
  challenge: z.object({
    prompt_text: z.string().min(20),
    hints: z.array(z.string().min(5)).min(3).max(5),
    difficulty: z.number().int().min(1).max(5),
    fun_fact: z.string().min(10),
  }),
})

function main() {
  const dataPath = join(__dirname, 'data/generated-challenges.json')
  let data: unknown[]

  try {
    data = JSON.parse(readFileSync(dataPath, 'utf-8'))
  } catch {
    console.error('No generated-challenges.json found. Run: npm run generate')
    process.exit(1)
  }

  console.log(`Validating ${data.length} challenges...\n`)

  let valid = 0
  let invalid = 0

  for (const item of data) {
    const result = ChallengeSchema.safeParse(item)
    if (result.success) {
      valid++
    } else {
      invalid++
      const entry = item as { event?: { title?: string } }
      console.error(`✗ ${entry.event?.title ?? 'Unknown'}:`)
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
      }
    }
  }

  console.log(`\nResults: ${valid} valid, ${invalid} invalid out of ${data.length}`)

  if (invalid > 0) {
    console.log('\nFix the issues in data/generated-challenges.json, then re-validate.')
    process.exit(1)
  }

  console.log('All challenges valid! Run: npm run import')
}

main()
