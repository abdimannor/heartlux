// Profile generation and matching. Pure functions (randomness is injectable).

const BIOS = {
  sv: [
    'Älskar att utforska nya städer och kulturer',
    'Fitnessentusiast och naturälskare',
    'Musiker och bokälskare',
    'Resenär med en passion för äventyr',
    'Lagar gärna middagar för vänner',
    'Yoga och meditation är min passion',
    'Chef till yrket och matälskare',
    'Konstälskare och fotograf',
    'Äventyrlystnad och spontan',
    'Njuter av långa promenader i naturen',
  ],
  en: [
    'Loves exploring new cities and cultures',
    'Fitness enthusiast and nature lover',
    'Musician and book lover',
    'Traveler with a passion for adventure',
    'Enjoys cooking dinners for friends',
    'Yoga and meditation are my passion',
    'Chef by profession and food lover',
    'Art lover and photographer',
    'Adventurous and spontaneous',
    'Loves long walks in nature',
  ],
};

const FIRST_NAMES = ['Emma','Anna','Sofia','Lisa','Maria','Eva','Karin','Petra','Johan','Anders','Lars','Erik','Michael','David','Nils','Per','Magnus','Thomas','Stefan','Daniel'];
const CITIES      = ['Stockholm','Göteborg','Malmö','Uppsala','Västerås','Örebro','Linköping','Helsingborg','Jönköping','Norrköping'];
/** Card prompts. Keys match the prompt.* strings in i18n.js. */
export const PROMPT_KEYS = ['sunday', 'green', 'dinner', 'secret', 'together'];

/** Small curated answer pools that fit each prompt (sample profiles only). */
const PROMPT_ANSWERS = {
  sv: {
    sunday:   ['Sovmorgon, loppis och en lång fika', 'En skogspromenad och soppa efteråt', 'Tidning, kaffe och ingen klocka'],
    green:    ['Människor som skrattar åt sina egna skämt', 'Någon som alltid har en bok i väskan', 'Ärlighet och dålig dansstil'],
    dinner:   ['Pasta med citron och parmesan', 'Linsgryta som räcker hela veckan', 'Tacos, alltid på fredagar'],
    secret:   ['har sprungit ett halvmaraton', 'kan spela dragspel', 'odlar chili på balkongen'],
    together: ['du gillar spontana dagsutflykter', 'du står ut med min playlist', 'du tycker att fika är en måltid'],
  },
  en: {
    sunday:   ['A lie-in, a flea market and a long coffee', 'A forest walk with soup afterwards', 'Papers, coffee and no clock'],
    green:    ['People who laugh at their own jokes', 'Someone who always carries a book', 'Honesty and bad dance moves'],
    dinner:   ['Pasta with lemon and parmesan', 'A lentil stew that lasts all week', 'Tacos, always on Fridays'],
    secret:   ['have run a half marathon', 'can play the accordion', 'grow chillies on my balcony'],
    together: ['you like spontaneous day trips', 'you can handle my playlist', 'you think a coffee break counts as a meal'],
  },
};

/** Every fourth sample profile has no prompt. Derived from the index, so the
 *  random sequence (and seeded tests) stay unchanged. */
export function samplePrompt(lang, i) {
  if (i % 4 === 3) return null;
  const key     = PROMPT_KEYS[i % PROMPT_KEYS.length];
  const answers = (lang === 'en' ? PROMPT_ANSWERS.en : PROMPT_ANSWERS.sv)[key];
  return { key, answer: answers[(i * 7) % answers.length] };
}

export const CITY_LIST = CITIES;
export const ALL_INTERESTS = ['travel','music','fitness','cooking','books','art'];

export const AVATAR_OPTIONS = ['👩','👨','👩‍🦱','👨‍🦱','👩‍🦰','👨‍🦰','👩‍🦳','👨‍🦳','🧕','👱‍♀️','👱','😊','😎','🌸','💫','⭐'];

const CHAT_REPLIES = {
  en: ['😊', "That's fun!", 'I agree!', '❤️', 'Absolutely!', 'Tell me more!', 'Haha!', 'Definitely 😄', 'Same here!', '🌸'],
  sv: ['😊', 'Haha, det är kul!', 'Håller med!', '❤️', 'Absolut!', 'Berätta mer!', 'Vad roligt!', 'Helt klart 😄', 'Ja, det tycker jag med!', '🌸'],
};

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

export function generateProfiles(lang = 'sv', rng = Math.random, count = 20) {
  const bioList = lang === 'en' ? BIOS.en : BIOS.sv;
  const profiles = [];
  for (let i = 0; i < count; i++) {
    const gender       = rng() > 0.5 ? 'male' : 'female';
    const numInterests = Math.floor(rng() * 4) + 2;
    const interests    = [];
    while (interests.length < numInterests) {
      const choice = pick(ALL_INTERESTS, rng);
      if (!interests.includes(choice)) interests.push(choice);
    }
    profiles.push({
      id:     i,
      name:   pick(FIRST_NAMES, rng),
      age:    Math.floor(rng() * 48) + 18,
      gender,
      city:   pick(CITIES, rng),
      bio:    pick(bioList, rng),
      interests,
      prompt: samplePrompt(lang, i),
      avatar: gender === 'male' ? '👨' : '👩',
    });
  }
  return profiles;
}

export function sharedInterests(profile, userInterests = []) {
  return profile.interests.filter(i => userInterests.includes(i)).length;
}

export function compatScore(profile, userInterests) {
  const shared = sharedInterests(profile, userInterests);
  return Math.round((shared / Math.max(profile.interests.length, userInterests.length, 1)) * 100);
}

/** Profiles that fit the saved preferences, best compatibility first. */
export function matchProfiles(profiles, prefs) {
  const userInts = prefs.interests || [];
  const minAge   = parseInt(prefs.minAge || 18, 10);
  const maxAge   = parseInt(prefs.maxAge || prefs.age || 80, 10);
  return profiles
    .filter(p =>
      parseInt(p.age, 10) >= minAge
      && parseInt(p.age, 10) <= maxAge
      && p.interests.some(i => userInts.includes(i))
      && (prefs.interest === 'everyone' || p.gender === prefs.interest))
    .map(p => ({ ...p, compat: compatScore(p, userInts) }))
    .sort((a, b) => b.compat - a.compat);
}

export const NO_FILTERS = Object.freeze({ minAge: 18, maxAge: 80, interests: [], city: '', hasPrompt: false });

/** Normalise stored filter values (bad or missing fields fall back to "no filter"). */
export function normaliseFilters(raw = {}) {
  const f = { ...NO_FILTERS, ...(raw || {}) };
  let minAge = Math.min(Math.max(parseInt(f.minAge, 10) || 18, 18), 80);
  let maxAge = Math.min(Math.max(parseInt(f.maxAge, 10) || 80, 18), 80);
  if (minAge > maxAge) [minAge, maxAge] = [maxAge, minAge];
  return {
    minAge, maxAge,
    interests: Array.isArray(f.interests) ? f.interests.filter(i => ALL_INTERESTS.includes(i)) : [],
    city:      CITIES.includes(f.city) ? f.city : '',
    hasPrompt: Boolean(f.hasPrompt),
  };
}

/** How many filters differ from the defaults (shown on the Filter button). */
export function activeFilterCount(raw) {
  const f = normaliseFilters(raw);
  return (f.minAge !== 18 || f.maxAge !== 80 ? 1 : 0)
    + (f.interests.length ? 1 : 0) + (f.city ? 1 : 0) + (f.hasPrompt ? 1 : 0);
}

/** Discover deck filters: age range, any of the chosen interests, city, has a prompt. */
export function applyFilters(profiles, raw) {
  const f = normaliseFilters(raw);
  return profiles.filter(p =>
    p.age >= f.minAge && p.age <= f.maxAge
    && (!f.interests.length || p.interests.some(i => f.interests.includes(i)))
    && (!f.city || p.city === f.city)
    && (!f.hasPrompt || Boolean(p.prompt)));
}

export function randomReply(lang, rng = Math.random) {
  return pick(lang === 'en' ? CHAT_REPLIES.en : CHAT_REPLIES.sv, rng);
}
