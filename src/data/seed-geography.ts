import type { Location } from '@/types'

export interface GeoChallenge {
  id: string
  prompt: string
  hints: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  fun_fact: string
  location: Location
}

export const seedGeoChallenges: GeoChallenge[] = [
  {
    id: 'geo-1', difficulty: 1, fun_fact: 'Tokyo is the most populous metropolitan area in the world with over 37 million people.',
    prompt: 'Find Tokyo, the capital of Japan.',
    hints: ['East Asia, on the Pacific coast', 'On the largest island of an archipelago', 'In a bay on the eastern coast of Honshu'],
    location: { id: 'gl-1', name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan', continent: 'Asia', type: 'city' },
  },
  {
    id: 'geo-2', difficulty: 1, fun_fact: 'The Amazon River carries more water than the next seven largest rivers combined.',
    prompt: 'Find the mouth of the Amazon River.',
    hints: ['Northern South America', 'Along the equator on the Atlantic coast', 'In the northeast of Brazil, near the city of Belém'],
    location: { id: 'gl-2', name: 'Amazon River Mouth', lat: -0.1833, lng: -49.9500, country: 'Brazil', continent: 'South America', type: 'body_of_water' },
  },
  {
    id: 'geo-3', difficulty: 2, fun_fact: 'Madagascar is home to around 11,000 plant species found nowhere else on Earth.',
    prompt: 'Find Madagascar.',
    hints: ['Off the southeastern coast of Africa', 'In the Indian Ocean', 'The fourth largest island in the world, east of Mozambique'],
    location: { id: 'gl-3', name: 'Madagascar', lat: -18.7669, lng: 46.8691, country: 'Madagascar', continent: 'Africa', type: 'region' },
  },
  {
    id: 'geo-4', difficulty: 2, fun_fact: 'Iceland sits on both the North American and Eurasian tectonic plates.',
    prompt: 'Find Iceland.',
    hints: ['In the North Atlantic Ocean', 'Between Europe and North America', 'Just south of the Arctic Circle, northwest of the UK'],
    location: { id: 'gl-4', name: 'Iceland', lat: 64.9631, lng: -19.0208, country: 'Iceland', continent: 'Europe', type: 'region' },
  },
  {
    id: 'geo-5', difficulty: 1, fun_fact: 'The Sahara is roughly the same size as the entire United States.',
    prompt: 'Find the Sahara Desert.',
    hints: ['Northern Africa', 'It stretches from the Atlantic to the Red Sea', 'The largest hot desert, covering most of North Africa'],
    location: { id: 'gl-5', name: 'Sahara Desert', lat: 23.4162, lng: 25.6628, country: 'Libya', continent: 'Africa', type: 'region' },
  },
  {
    id: 'geo-6', difficulty: 3, fun_fact: 'Lake Baikal contains about 20% of the world\'s unfrozen fresh water.',
    prompt: 'Find Lake Baikal, the deepest lake on Earth.',
    hints: ['In northern Asia', 'In the southern part of Siberia', 'A crescent-shaped lake north of Mongolia'],
    location: { id: 'gl-6', name: 'Lake Baikal', lat: 53.5587, lng: 108.1650, country: 'Russia', continent: 'Asia', type: 'body_of_water' },
  },
  {
    id: 'geo-7', difficulty: 2, fun_fact: 'New Zealand was one of the last major landmasses to be settled by humans, around 1300 AD.',
    prompt: 'Find New Zealand.',
    hints: ['In the southwestern Pacific Ocean', 'Southeast of Australia', 'Two main islands roughly 2,000 km east of Australia'],
    location: { id: 'gl-7', name: 'New Zealand', lat: -40.9006, lng: 174.8860, country: 'New Zealand', continent: 'Oceania', type: 'region' },
  },
  {
    id: 'geo-8', difficulty: 3, fun_fact: 'Ulaanbaatar is the coldest capital city in the world with winter temperatures dropping below -40°.',
    prompt: 'Find Ulaanbaatar, the capital of Mongolia.',
    hints: ['In Central/East Asia', 'A landlocked country between Russia and China', 'In the north-central part of the country, in a river valley'],
    location: { id: 'gl-8', name: 'Ulaanbaatar', lat: 47.8864, lng: 106.9057, country: 'Mongolia', continent: 'Asia', type: 'city' },
  },
  {
    id: 'geo-9', difficulty: 1, fun_fact: 'The Mediterranean Sea is slowly shrinking and will eventually close as Africa moves north.',
    prompt: 'Find the Strait of Gibraltar.',
    hints: ['Between Europe and Africa', 'Western Mediterranean', 'The narrow passage connecting the Atlantic Ocean to the Mediterranean Sea'],
    location: { id: 'gl-9', name: 'Strait of Gibraltar', lat: 35.9667, lng: -5.5000, country: 'Spain', continent: 'Europe', type: 'body_of_water' },
  },
  {
    id: 'geo-10', difficulty: 2, fun_fact: 'Mount Kilimanjaro is a dormant volcano and the tallest freestanding mountain in the world.',
    prompt: 'Find Mount Kilimanjaro.',
    hints: ['In East Africa', 'Near the border of two countries, close to the equator', 'In northeastern Tanzania, visible from Kenya'],
    location: { id: 'gl-10', name: 'Mount Kilimanjaro', lat: -3.0674, lng: 37.3556, country: 'Tanzania', continent: 'Africa', type: 'landmark' },
  },
  {
    id: 'geo-11', difficulty: 3, fun_fact: 'Bhutan measures national success by Gross National Happiness instead of GDP.',
    prompt: 'Find Bhutan.',
    hints: ['In South Asia', 'In the Himalayas between two very large countries', 'East of Nepal, wedged between India and China'],
    location: { id: 'gl-11', name: 'Bhutan', lat: 27.5142, lng: 90.4336, country: 'Bhutan', continent: 'Asia', type: 'region' },
  },
  {
    id: 'geo-12', difficulty: 2, fun_fact: 'The Panama Canal saves ships a 12,000 km journey around South America.',
    prompt: 'Find the Panama Canal.',
    hints: ['In Central America', 'On the narrowest part of the Americas', 'Connecting the Atlantic and Pacific through a small country between Colombia and Costa Rica'],
    location: { id: 'gl-12', name: 'Panama Canal', lat: 9.0801, lng: -79.6811, country: 'Panama', continent: 'North America', type: 'landmark' },
  },
  {
    id: 'geo-13', difficulty: 4, fun_fact: 'Svalbard has a global seed vault preserving over 1 million seed samples from around the world.',
    prompt: 'Find Svalbard.',
    hints: ['In the Arctic Ocean', 'A Norwegian archipelago far north of mainland Europe', 'Roughly halfway between Norway and the North Pole'],
    location: { id: 'gl-13', name: 'Svalbard', lat: 78.2232, lng: 15.6267, country: 'Norway', continent: 'Europe', type: 'region' },
  },
  {
    id: 'geo-14', difficulty: 3, fun_fact: 'The Dead Sea is the lowest point on land at 430 meters below sea level.',
    prompt: 'Find the Dead Sea.',
    hints: ['In the Middle East', 'Bordered by two countries and a territory', 'A salt lake on the border of Israel and Jordan'],
    location: { id: 'gl-14', name: 'Dead Sea', lat: 31.5, lng: 35.5, country: 'Israel', continent: 'Asia', type: 'body_of_water' },
  },
  {
    id: 'geo-15', difficulty: 4, fun_fact: 'Timbuktu was one of the wealthiest cities in the world during the 14th century.',
    prompt: 'Find Timbuktu.',
    hints: ['In West Africa', 'On the southern edge of the Sahara Desert', 'In the landlocked country of Mali, near the Niger River'],
    location: { id: 'gl-15', name: 'Timbuktu', lat: 16.7666, lng: -3.0026, country: 'Mali', continent: 'Africa', type: 'city' },
  },
]
