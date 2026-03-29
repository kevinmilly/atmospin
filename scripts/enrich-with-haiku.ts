/**
 * scripts/enrich-with-haiku.ts
 * Reads raw-places.json, calls Claude Haiku to generate prompts, hints,
 * fun facts and Learn Mode content, writes enriched-places.json.
 * Run: npx tsx scripts/enrich-with-haiku.ts [--limit N] [--resume]
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW = join(__dirname, 'data', 'raw-places.json')
const OUT = join(__dirname, 'data', 'enriched-places.json')

const args = process.argv.slice(2)
const limitArg = args.indexOf('--limit')
const LIMIT = limitArg >= 0 ? parseInt(args[limitArg + 1]) : Infinity
const RESUME = args.includes('--resume')
const CONCURRENCY = 5

interface RawPlace {
  id: string; name: string; country: string
  lat: number; lng: number; category: string; wikidataId: string
}

export interface EnrichedPlace {
  id: string; name: string; country: string
  lat: number; lng: number; category: string
  difficulty: number
  prompt: string
  hints: string[]
  fun_fact: string
  learn_fact: string
  quiz_question: string
  quiz_answers: string[]  // index 0 is always correct answer
  quiz_correct: number    // always 0
  // Note: climate and region_context have been removed — geo context is embedded in prompt
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function enrichPlace(place: RawPlace): Promise<EnrichedPlace> {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are writing content for a geography guessing game called Atmospin. Players must place a pin on a globe to locate the place.

Generate content for: ${place.name}, ${place.country} (category: ${place.category}, lat: ${place.lat.toFixed(1)}, lng: ${place.lng.toFixed(1)})

The PROMPT is the most important field. It must:
- Be 1-2 sentences
- NOT name the place, country, or any named sub-region
- Naturally embed geographic orientation clues: hemisphere (north/south), broad climate zone (tropical, arid, temperate, polar, etc.), and broad region (e.g. "in Central Asia", "on the East African coast", "in the South Pacific")
- Describe what makes the place distinctive — its physical form, scale, atmosphere, or phenomenon
- Read as evocative, not encyclopedic — like a riddle, not a textbook sentence

BAD example: "This is a UNESCO World Heritage Site in France."
GOOD example: "Deep in the temperate rainforests of South America's southern cone, this ancient granite massif rises dramatically above a windswept Patagonian plateau."

Return ONLY valid JSON:
{
  "difficulty": <1-5, 1=very famous globally, 5=very obscure>,
  "prompt": "<1-2 sentence evocative clue with embedded geo context>",
  "hints": ["<broad region/continent hint>", "<country or sub-region hint>", "<specific local detail>"],
  "fun_fact": "<one surprising sentence>",
  "learn_fact": "<2-3 sentences of genuinely weird-but-true trivia>",
  "quiz_question": "<question testing the learn_fact>",
  "quiz_answers": ["<correct answer>", "<plausible wrong>", "<plausible wrong>", "<plausible wrong>"]
}

Rules:
- prompt must not contain the place name, country name, or any named geographic region (continent names are ok as part of orientation)
- quiz_answers[0] is always correct
- difficulty: 1 = Eiffel Tower level, 5 = obscure local landmark most people have never heard of`,
    }],
  })

  const raw = (msg.content[0] as { type: string; text: string }).text.trim()
  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const data = JSON.parse(json)

  return {
    id: place.id,
    name: place.name,
    country: place.country,
    lat: place.lat,
    lng: place.lng,
    category: place.category,
    difficulty: Math.min(5, Math.max(1, Math.round(data.difficulty))),
    prompt: data.prompt,
    hints: data.hints.slice(0, 3),
    fun_fact: data.fun_fact,
    learn_fact: data.learn_fact,
    quiz_question: data.quiz_question,
    quiz_answers: data.quiz_answers.slice(0, 4),
    quiz_correct: 0,
  }
}

async function processBatch(batch: RawPlace[]): Promise<EnrichedPlace[]> {
  const results = await Promise.allSettled(batch.map(enrichPlace))
  return results
    .filter((r): r is PromiseFulfilledResult<EnrichedPlace> => r.status === 'fulfilled')
    .map(r => r.value)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in .env.local')
    process.exit(1)
  }

  const raw: RawPlace[] = JSON.parse(readFileSync(RAW, 'utf8'))
  let existing: EnrichedPlace[] = RESUME && existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, 'utf8'))
    : []

  const existingIds = new Set(existing.map(p => p.id))
  const todo = raw
    .filter(p => !existingIds.has(p.id))
    .slice(0, LIMIT === Infinity ? raw.length : LIMIT)

  console.log(`🤖 Enriching ${todo.length} places with Haiku (${CONCURRENCY} concurrent)...\n`)
  if (RESUME) console.log(`   (resuming — ${existing.length} already done)\n`)

  let done = 0
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY)
    const enriched = await processBatch(batch)
    existing = [...existing, ...enriched]
    done += enriched.length
    const failed = batch.length - enriched.length
    process.stdout.write(`  [${done}/${todo.length}] ✓${enriched.length}${failed ? ` ✗${failed}` : ''}\r`)
    writeFileSync(OUT, JSON.stringify(existing, null, 2))
    // Small delay between batches to be polite to the API
    if (i + CONCURRENCY < todo.length) await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n\n✅ ${existing.length} enriched places → ${OUT}`)
  const cost = (todo.length * 400 / 1_000_000 * 0.80).toFixed(4)
  console.log(`💰 Estimated cost: ~$${cost}`)
}

main().catch(err => { console.error(err); process.exit(1) })
