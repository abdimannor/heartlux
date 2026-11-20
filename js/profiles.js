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

export function randomReply(lang, rng = Math.random) {
  return pick(lang === 'en' ? CHAT_REPLIES.en : CHAT_REPLIES.sv, rng);
}
