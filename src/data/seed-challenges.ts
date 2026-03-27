import type { HuntChallenge, HistoricalEvent, Location } from '@/types'

// Local seed data for development and offline play
// These will be replaced by Supabase data once the pipeline runs

const locations: Location[] = [
  { id: 'loc-1', name: 'Bethel', lat: 41.6998, lng: -74.9226, country: 'United States', continent: 'North America', type: 'landmark' },
  { id: 'loc-2', name: 'Berlin', lat: 52.5163, lng: 13.3777, country: 'Germany', continent: 'Europe', type: 'city' },
  { id: 'loc-3', name: 'Giza', lat: 29.9792, lng: 31.1342, country: 'Egypt', continent: 'Africa', type: 'landmark' },
  { id: 'loc-4', name: 'Hiroshima', lat: 34.3853, lng: 132.4553, country: 'Japan', continent: 'Asia', type: 'city' },
  { id: 'loc-5', name: 'Kitty Hawk', lat: 36.0826, lng: -75.7055, country: 'United States', continent: 'North America', type: 'landmark' },
  { id: 'loc-6', name: 'Normandy', lat: 49.3375, lng: -0.8787, country: 'France', continent: 'Europe', type: 'region' },
  { id: 'loc-7', name: 'Pompeii', lat: 40.7462, lng: 14.4989, country: 'Italy', continent: 'Europe', type: 'landmark' },
  { id: 'loc-8', name: 'Machu Picchu', lat: -13.1631, lng: -72.5450, country: 'Peru', continent: 'South America', type: 'landmark' },
  { id: 'loc-9', name: 'Cape Canaveral', lat: 28.5721, lng: -80.6480, country: 'United States', continent: 'North America', type: 'landmark' },
  { id: 'loc-10', name: 'Constantinople', lat: 41.0082, lng: 28.9784, country: 'Turkey', continent: 'Europe', type: 'city' },
  { id: 'loc-11', name: 'Chernobyl', lat: 51.3890, lng: 30.0992, country: 'Ukraine', continent: 'Europe', type: 'landmark' },
  { id: 'loc-12', name: 'Galápagos Islands', lat: -0.9538, lng: -90.9656, country: 'Ecuador', continent: 'South America', type: 'region' },
  { id: 'loc-13', name: 'Philadelphia', lat: 39.9486, lng: -75.1499, country: 'United States', continent: 'North America', type: 'city' },
  { id: 'loc-14', name: 'Easter Island', lat: -27.1127, lng: -109.3497, country: 'Chile', continent: 'South America', type: 'landmark' },
  { id: 'loc-15', name: 'Lascaux', lat: 45.0514, lng: 1.1686, country: 'France', continent: 'Europe', type: 'landmark' },
]

const events: HistoricalEvent[] = [
  { id: 'evt-1', location_id: 'loc-1', title: 'Woodstock Music Festival', description: 'A three-day music festival that became a defining moment of the counterculture movement.', year_start: 1969, year_end: null, era: 'Modern', tags: ['music', 'culture'] },
  { id: 'evt-2', location_id: 'loc-2', title: 'Fall of the Berlin Wall', description: 'The opening of the Berlin Wall marked the end of the Cold War.', year_start: 1989, year_end: null, era: 'Modern', tags: ['politics', 'cold war'] },
  { id: 'evt-3', location_id: 'loc-3', title: 'Construction of the Great Pyramid', description: 'Built as a tomb for Pharaoh Khufu, the tallest man-made structure for 3,800 years.', year_start: -2560, year_end: null, era: 'Ancient', tags: ['architecture', 'wonder'] },
  { id: 'evt-4', location_id: 'loc-4', title: 'Atomic Bombing of Hiroshima', description: 'The first nuclear weapon used in warfare, leading to the end of WWII.', year_start: 1945, year_end: null, era: 'Modern', tags: ['war', 'nuclear'] },
  { id: 'evt-5', location_id: 'loc-5', title: 'First Powered Flight', description: 'The Wright Brothers achieved the first sustained, controlled, powered flight.', year_start: 1903, year_end: null, era: 'Modern', tags: ['aviation', 'invention'] },
  { id: 'evt-6', location_id: 'loc-6', title: 'D-Day Invasion', description: 'The largest seaborne invasion in history opened a second front in WWII.', year_start: 1944, year_end: null, era: 'Modern', tags: ['war', 'wwii'] },
  { id: 'evt-7', location_id: 'loc-7', title: 'Eruption of Mount Vesuvius', description: 'Vesuvius buried Pompeii and Herculaneum under volcanic ash.', year_start: 79, year_end: null, era: 'Ancient', tags: ['volcano', 'disaster'] },
  { id: 'evt-8', location_id: 'loc-8', title: 'Construction of Machu Picchu', description: 'Inca emperor Pachacuti built this citadel high in the Andes.', year_start: 1450, year_end: null, era: 'Pre-Columbian', tags: ['architecture', 'inca'] },
  { id: 'evt-9', location_id: 'loc-9', title: 'Apollo 11 Launch', description: 'Apollo 11 launched carrying the first humans to walk on the Moon.', year_start: 1969, year_end: null, era: 'Modern', tags: ['space', 'nasa'] },
  { id: 'evt-10', location_id: 'loc-10', title: 'Fall of Constantinople', description: 'Ottoman Sultan Mehmed II conquered the Byzantine capital, ending the Roman Empire.', year_start: 1453, year_end: null, era: 'Medieval', tags: ['war', 'ottoman'] },
  { id: 'evt-11', location_id: 'loc-11', title: 'Chernobyl Nuclear Disaster', description: 'Reactor No. 4 exploded, causing the worst nuclear disaster in history.', year_start: 1986, year_end: null, era: 'Modern', tags: ['disaster', 'nuclear'] },
  { id: 'evt-12', location_id: 'loc-12', title: "Darwin's Visit to the Galápagos", description: 'Darwin observed unique wildlife that inspired his theory of evolution.', year_start: 1835, year_end: null, era: 'Early Modern', tags: ['science', 'evolution'] },
  { id: 'evt-13', location_id: 'loc-13', title: 'Signing of the Declaration of Independence', description: 'The thirteen colonies declared sovereignty from Britain.', year_start: 1776, year_end: null, era: 'Early Modern', tags: ['politics', 'revolution'] },
  { id: 'evt-14', location_id: 'loc-14', title: 'Creation of the Moai Statues', description: 'The Rapa Nui carved nearly 900 massive stone statues.', year_start: 1250, year_end: null, era: 'Medieval', tags: ['architecture', 'mystery'] },
  { id: 'evt-15', location_id: 'loc-15', title: 'Lascaux Cave Paintings', description: 'Prehistoric humans created stunning cave paintings of animals.', year_start: -15000, year_end: null, era: 'Prehistoric', tags: ['art', 'prehistoric'] },
]

export const seedChallenges: (HuntChallenge & { event: HistoricalEvent; location: Location })[] = [
  {
    id: 'ch-1', event_id: 'evt-1', difficulty: 2, fun_fact: 'The festival was actually held in Bethel, NY — not the town of Woodstock, which is 60 miles away.',
    prompt_text: 'A legendary three-day gathering on a dairy farm drew hundreds of thousands to celebrate peace, love, and music at the height of the counterculture era.',
    hints: ['Look in North America', 'The northeastern United States, in a rural area', 'A small town in upstate New York — not the town the festival is named after'],
    event: events[0], location: locations[0],
  },
  {
    id: 'ch-2', event_id: 'evt-2', difficulty: 1, fun_fact: 'A miscommunication during a press conference accidentally triggered the opening — the spokesman said travel restrictions were lifted "immediately."',
    prompt_text: 'A concrete barrier that divided a city and symbolized the Iron Curtain was breached by jubilant crowds, marking the symbolic end of an ideological divide.',
    hints: ['This happened in Europe', 'In the capital of a country that was once divided in two', 'The city sits on the Spree River in northeastern Germany'],
    event: events[1], location: locations[1],
  },
  {
    id: 'ch-3', event_id: 'evt-3', difficulty: 2, fun_fact: 'The Great Pyramid was originally covered in polished white limestone that would have gleamed brilliantly in the sunlight.',
    prompt_text: 'An ancient ruler commissioned a monumental tomb on a desert plateau that would stand as the tallest structure on Earth for nearly four millennia.',
    hints: ['Look in northeastern Africa', 'Near the banks of the world\'s longest river', 'On a plateau just outside one of the largest cities in the Arab world'],
    event: events[2], location: locations[2],
  },
  {
    id: 'ch-4', event_id: 'evt-4', difficulty: 1, fun_fact: 'A Ginkgo tree that survived the blast still grows less than a mile from the hypocenter and is known as a "survivor tree."',
    prompt_text: 'A devastating new weapon was unleashed on a coastal city, instantly reshaping global politics and ending the deadliest conflict in human history.',
    hints: ['This occurred in East Asia', 'On the main islands of an archipelago nation', 'A port city in the western part of Japan\'s largest island'],
    event: events[3], location: locations[3],
  },
  {
    id: 'ch-5', event_id: 'evt-5', difficulty: 2, fun_fact: 'The first flight lasted only 12 seconds and covered just 120 feet — less than the wingspan of a modern Boeing 747.',
    prompt_text: 'Two bicycle mechanics made history on a windswept strip of sand, achieving what humanity had dreamed of for centuries — sustained, powered flight.',
    hints: ['Along the Atlantic coast of North America', 'In the southeastern United States, on a barrier island', 'A windswept area on the Outer Banks of North Carolina'],
    event: events[4], location: locations[4],
  },
  {
    id: 'ch-6', event_id: 'evt-6', difficulty: 2, fun_fact: 'The invasion was originally planned for June 5 but was delayed by one day due to bad weather.',
    prompt_text: 'The largest amphibious invasion in history stormed a series of beaches at dawn, opening a crucial second front that would turn the tide of a global war.',
    hints: ['Look along the northern coast of France', 'The English Channel coastline', 'A stretch of beaches in a region famous for its apple orchards and Camembert cheese'],
    event: events[5], location: locations[5],
  },
  {
    id: 'ch-7', event_id: 'evt-7', difficulty: 2, fun_fact: 'The eruption released thermal energy 100,000 times greater than the atomic bombings of Hiroshima and Nagasaki.',
    prompt_text: 'A towering volcano near the coast unleashed a catastrophic eruption that buried thriving Roman cities under meters of ash, preserving them as time capsules.',
    hints: ['Southern Europe, near the Mediterranean', 'Along the western coast of the Italian peninsula', 'In the Bay of Naples, near a still-active volcano'],
    event: events[6], location: locations[6],
  },
  {
    id: 'ch-8', event_id: 'evt-8', difficulty: 2, fun_fact: 'The site was never found by Spanish conquistadors and remained unknown to the outside world until 1911.',
    prompt_text: 'A pre-Columbian emperor built a stunning citadel on a mountain ridge above the clouds, a royal estate that would remain hidden from outsiders for centuries.',
    hints: ['In South America, along the western mountain range', 'High in the Andes of a country known for its ancient civilizations', 'On a ridge between two peaks, above the Urubamba River valley'],
    event: events[7], location: locations[7],
  },
  {
    id: 'ch-9', event_id: 'evt-9', difficulty: 2, fun_fact: 'The Saturn V rocket that launched the mission remains the most powerful rocket ever successfully flown.',
    prompt_text: 'A massive rocket lifted off from a coastal launch site, carrying three astronauts on a journey that would see humans set foot on another world for the first time.',
    hints: ['On the east coast of North America', 'Along the central Florida coastline', 'A barrier island that has been America\'s primary launch site since the Space Race'],
    event: events[8], location: locations[8],
  },
  {
    id: 'ch-10', event_id: 'evt-10', difficulty: 3, fun_fact: 'Sultan Mehmed was only 21 years old when he achieved what many considered impossible — breaching the legendary Theodosian Walls.',
    prompt_text: 'A young sultan\'s army breached the legendary walls of a city that had stood as the last bastion of a 1,500-year-old empire, reshaping the Mediterranean world.',
    hints: ['At the crossroads of Europe and Asia', 'A city that straddles a famous strait connecting two seas', 'On the Bosporus, in what is now the largest city in its country'],
    event: events[9], location: locations[9],
  },
  {
    id: 'ch-11', event_id: 'evt-11', difficulty: 2, fun_fact: 'The exclusion zone around the site has become an accidental wildlife sanctuary, with wolves, wild horses, and other animals thriving.',
    prompt_text: 'A routine safety test at a power plant went catastrophically wrong, releasing a radioactive cloud across an entire continent and creating a permanent exclusion zone.',
    hints: ['In Eastern Europe', 'In the northern part of a country bordered by the Black Sea', 'Near the city of Pripyat, close to the border with Belarus'],
    event: events[10], location: locations[10],
  },
  {
    id: 'ch-12', event_id: 'evt-12', difficulty: 3, fun_fact: 'Darwin spent only five weeks on the islands, yet they inspired perhaps the most important scientific theory in history.',
    prompt_text: 'A young naturalist aboard a survey ship observed unique species on volcanic islands that would later inspire a revolutionary theory about the origin of all living things.',
    hints: ['In the Pacific Ocean, near the equator', 'Off the western coast of South America', 'A volcanic archipelago about 600 miles west of the mainland'],
    event: events[11], location: locations[11],
  },
  {
    id: 'ch-13', event_id: 'evt-13', difficulty: 2, fun_fact: 'Only two people signed on July 4th. Most delegates signed the document on August 2nd.',
    prompt_text: 'Representatives of thirteen colonies gathered in a stately hall to adopt a radical document declaring their right to self-governance, sparking a revolution.',
    hints: ['On the east coast of North America', 'In a major port city in the mid-Atlantic region', 'A city named after a Greek concept meaning "brotherly love"'],
    event: events[12], location: locations[12],
  },
  {
    id: 'ch-14', event_id: 'evt-14', difficulty: 3, fun_fact: 'The average Moai weighs about 14 tons, but the largest ever erected weighed 82 tons.',
    prompt_text: 'An isolated Polynesian civilization carved and transported hundreds of massive stone figures across their remote island home, a feat that still baffles researchers.',
    hints: ['In the southeastern Pacific Ocean', 'One of the most remote inhabited islands on Earth', 'A Chilean territory thousands of miles from the mainland'],
    event: events[13], location: locations[13],
  },
  {
    id: 'ch-15', event_id: 'evt-15', difficulty: 3, fun_fact: 'The caves were discovered by four teenagers and their dog in 1940.',
    prompt_text: 'Deep underground, prehistoric artists created a breathtaking gallery of animal paintings that would remain hidden for thousands of years — among the finest examples of Ice Age art.',
    hints: ['In Western Europe', 'In the southwest of a country known for wine and cheese', 'In the Dordogne region, famous for its prehistoric sites'],
    event: events[14], location: locations[14],
  },
]
