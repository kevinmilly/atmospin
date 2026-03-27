import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const promptTemplate = readFileSync(join(__dirname, 'prompts/hunt-prompt-template.txt'), 'utf-8')
const seedEvents = JSON.parse(readFileSync(join(__dirname, 'seed-events.json'), 'utf-8'))

interface SeedEntry {
  location: { name: string; lat: number; lng: number; country: string; continent: string; type: string }
  event: { title: string; description: string; year_start: number; era: string; tags: string[] }
}

interface GeneratedChallenge {
  location: SeedEntry['location']
  event: SeedEntry['event']
  challenge: {
    prompt_text: string
    hints: string[]
    difficulty: number
    fun_fact: string
  }
}

async function generateChallenge(entry: SeedEntry): Promise<GeneratedChallenge | null> {
  const filled = promptTemplate
    .replace('{{title}}', entry.event.title)
    .replace('{{location_name}}', entry.location.name)
    .replace('{{country}}', entry.location.country)
    .replace('{{lat}}', String(entry.location.lat))
    .replace('{{lng}}', String(entry.location.lng))
    .replace('{{year_start}}', String(entry.event.year_start))
    .replace('{{description}}', entry.event.description)

  try {
    const result = await model.generateContent(filled)
    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim()
    const challenge = JSON.parse(cleaned)

    // Basic validation
    if (!challenge.prompt_text || !Array.isArray(challenge.hints) || challenge.hints.length < 3) {
      console.warn(`  Skipping ${entry.event.title}: invalid structure`)
      return null
    }

    console.log(`  ✓ ${entry.event.title} (difficulty: ${challenge.difficulty})`)
    return { location: entry.location, event: entry.event, challenge }
  } catch (err) {
    console.error(`  ✗ ${entry.event.title}: ${err}`)
    return null
  }
}

async function main() {
  console.log(`Generating hunt challenges for ${seedEvents.length} events...\n`)

  const results: GeneratedChallenge[] = []

  // Process sequentially to avoid rate limits
  for (const entry of seedEvents as SeedEntry[]) {
    const result = await generateChallenge(entry)
    if (result) results.push(result)

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 500))
  }

  const outputPath = join(__dirname, 'data/generated-challenges.json')
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\nDone! Generated ${results.length}/${seedEvents.length} challenges`)
  console.log(`Output: ${outputPath}`)
  console.log('\nReview the output, then run: npm run import')
}

main()
