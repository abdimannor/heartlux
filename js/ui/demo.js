// One-click demo account with three seeded matches.
import { KEYS, getUser, setItem, writeJSON, clearUserData, resetMatchState } from '../state.js';
import { t, getLang } from '../i18n.js';
import { generateProfiles, compatScore } from '../profiles.js';
import { showPage, updateNavbar, updateMatchBadge } from './navigation.js';

const DEMO_PREFERENCES = {
  interest: 'everyone',
  minAge: 22,
  maxAge: 38,
  interests: ['travel', 'music', 'books', 'art'],
};

/** Three generated profiles that fit the demo preferences, with ids that never
 *  collide with browse profiles (0-19), which share chat and "seen" state by id. */
export function seedDemoMatches(profiles, prefs = DEMO_PREFERENCES) {
  return profiles
    .filter(p => p.age >= prefs.minAge && p.age <= prefs.maxAge
      && p.interests.some(i => prefs.interests.includes(i)))
    .slice(0, 3)
    .map((p, i) => ({ ...p, id: `demo-${i}`, compat: compatScore(p, prefs.interests) }));
}

export function startDemo() {
  // Never silently overwrite a real local account.
  const existing = getUser();
  if (existing && !existing.demo && !confirm(t('demo.confirm'))) return;

  clearUserData();

  const now = new Date().toISOString();
  writeJSON(KEYS.user, { username: 'Demo', email: 'demo@heartlux.local', gender: 'other', demo: true, createdAt: now });
  setItem(KEYS.interest, DEMO_PREFERENCES.interest);
  writeJSON(KEYS.prefs, { ...DEMO_PREFERENCES, completedAt: now });
  writeJSON(KEYS.likes, []);
  writeJSON(KEYS.passes, []);
  writeJSON(KEYS.seen, []);

  const demoMatches = seedDemoMatches(generateProfiles(getLang()));
  writeJSON(KEYS.matches, demoMatches);
  setItem(KEYS.unread, demoMatches.length);

  resetMatchState({ matchedProfiles: demoMatches });
  updateNavbar();
  updateMatchBadge();
  showPage('matches');
}
