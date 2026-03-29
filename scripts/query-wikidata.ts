/**
 * scripts/query-wikidata.ts
 * Queries Wikidata for geographically distributed notable places and writes
 * raw-places.json. Run: npx tsx scripts/query-wikidata.ts [--limit N]
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'data', 'raw-places.json')

const args = process.argv.slice(2)
const limitArg = args.indexOf('--limit')
const LIMIT_PER_QUERY = limitArg >= 0 ? parseInt(args[limitArg + 1]) : 400

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql'

interface RawPlace {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  category: string
  wikidataId: string
}

async function runSparql(sparql: string): Promise<RawPlace[]> {
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Atmospin/1.0 (geography learning app)' },
  })
  if (!res.ok) throw new Error(`Wikidata SPARQL failed: ${res.status} ${res.statusText}`)
  const json = await res.json() as { results: { bindings: Record<string, { value: string }>[] } }
  return json.results.bindings.map(b => ({
    id: `wd_${b.item.value.split('/').pop()}`,
    name: b.itemLabel.value,
    country: b.countryLabel?.value ?? 'Unknown',
    lat: parseFloat(b.lat.value),
    lng: parseFloat(b.lng.value),
    category: b.category?.value ?? 'landmark',
    wikidataId: b.item.value.split('/').pop() ?? '',
  })).filter(p =>
    p.name && p.country && p.country !== 'Unknown' &&
    !isNaN(p.lat) && !isNaN(p.lng) &&
    // Filter out Wikidata meta-labels like Q123456
    !/^Q\d+$/.test(p.name)
  )
}

const QUERIES = [
  {
    label: 'UNESCO World Heritage Sites',
    category: 'heritage',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  ?item wdt:P1435 wd:Q9259 .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
  {
    label: 'Notable Mountains',
    category: 'nature',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  VALUES ?type { wd:Q8502 wd:Q207326 wd:Q1081138 }
  ?item wdt:P31 ?type .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  ?item wdt:P18 [] .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
  {
    label: 'Notable Islands',
    category: 'nature',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  VALUES ?type { wd:Q23442 wd:Q11799049 }
  ?item wdt:P31 ?type .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  ?item wdt:P18 [] .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
  {
    label: 'Notable Lakes',
    category: 'nature',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  ?item wdt:P31 wd:Q23397 .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  ?item wdt:P18 [] .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
  {
    label: 'Famous Monuments',
    category: 'landmark',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  VALUES ?type { wd:Q4989906 wd:Q839954 wd:Q570116 wd:Q33506 }
  ?item wdt:P31 ?type .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  ?item wdt:P18 [] .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
  {
    label: 'National Parks',
    category: 'nature',
    sparql: (limit: number) => `
SELECT DISTINCT ?item ?itemLabel ?lat ?lng ?countryLabel WHERE {
  VALUES ?type { wd:Q46169 wd:Q179049 }
  ?item wdt:P31 ?type .
  ?item p:P625/psv:P625 ?geo .
  ?geo wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  ?item wdt:P17 ?country .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
LIMIT ${limit}`,
  },
]

async function main() {
  console.log(`🌍 Querying Wikidata (${LIMIT_PER_QUERY} per category)...\n`)
  mkdirSync(join(__dirname, 'data'), { recursive: true })

  const all: RawPlace[] = []
  const seen = new Set<string>()

  for (const q of QUERIES) {
    process.stdout.write(`  ${q.label}... `)
    try {
      const results = await runSparql(q.sparql(LIMIT_PER_QUERY))
      const unique = results
        .map(p => ({ ...p, category: q.category }))
        .filter(p => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })
      all.push(...unique)
      console.log(`✓ ${unique.length} places`)
      // Be polite to Wikidata
      await new Promise(r => setTimeout(r, 1500))
    } catch (err) {
      console.log(`✗ failed: ${err}`)
    }
  }

  writeFileSync(OUT, JSON.stringify(all, null, 2))
  console.log(`\n✅ ${all.length} total places → ${OUT}`)
}

main().catch(err => { console.error(err); process.exit(1) })
