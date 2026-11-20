// Browse tab: the profile card deck, like / pass / undo, match popup and stats.
import { KEYS, session, readJSON, writeJSON, getPrefs, getUnread, setItem, resetMatchState } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { generateProfiles, matchProfiles, sharedInterests } from '../profiles.js';
import { updateMatchBadge } from './navigation.js';
import { initSwipeGesture } from './swipe.js';
import { later } from '../timers.js';
import { paintAvatar } from '../avatars.js';

export { showMatchesTab } from './matches-list.js';

function setDeckVisible(hasProfile) {
  setVisible(byId('profileCard'), hasProfile);
  setVisible(byId('actionButtons'), hasProfile);
  setVisible(byId('noMoreProfiles'), !hasProfile);
}

function renderNoPreferences(container) {
  container.replaceChildren(
    h('div', { className: 'empty-state' },
      h('div', { className: 'empty-emoji' }, '🎀'),
      h('h2', {}, t('matches.noprofile.title')),
      h('p', {}, t('matches.noprofile.text')),
      h('button', {
        type: 'button',
        className: 'btn btn-primary btn-lg u-mt-15',
        dataset: { action: 'showPage', arg: 'discover' },
      }, t('matches.noprofile.btn'))));
}

export function initMatches() {
  const prefs = getPrefs();
  if (!byId('profileCard')) return;

  if (!prefs) {
    resetMatchState({ matches: 0 });
    updateStats();
    setDeckVisible(false);
    const noMore = byId('noMoreProfiles');
    if (noMore) renderNoPreferences(noMore);
    return;
  }

  const state = session.match;
  if (state.profiles.length === 0) {
    state.likes           = readJSON(KEYS.likes, []);
    state.passes          = readJSON(KEYS.passes, []);
    state.matchedProfiles = readJSON(KEYS.matches, []);
    state.profiles        = matchProfiles(generateProfiles(getLang()), prefs);
  }

  updateStats();
  loadProfile();
  initSwipeGesture();
}

export function currentProfile() {
  const state = session.match;
  return state.currentProfileIndex < state.profiles.length
    ? state.profiles[state.currentProfileIndex]
    : null;
}

export function loadProfile() {
  const profile = currentProfile();
  setDeckVisible(Boolean(profile));
  if (!profile) return;

  byId('cardName').textContent     = `${profile.name}, ${profile.age}`;
  byId('cardLocation').textContent = `📍 ${profile.city}`;
  byId('cardBio').textContent      = profile.bio;
  paintAvatar(byId('cardAvatar'), profile);

  byId('interestsList').replaceChildren(
    ...profile.interests.map(i => h('div', { className: 'interest-tag' }, t(`interest.${i}`))));

  const compatEl = byId('cardCompat');
  if (compatEl) {
    const shared = sharedInterests(profile, (getPrefs() || {}).interests || []);
    if (shared > 0) compatEl.textContent = t('matches.compat', { n: shared });
    setVisible(compatEl, shared > 0);
  }

  const card = byId('profileCard');
  card.classList.remove('card-appear');
  void card.offsetWidth;
  card.classList.add('card-appear');

  session.match.shown.push(profile.id);
  updateStats();
}

export function likeProfile(fromSwipe = false) {
  const profile = currentProfile();
  if (!profile) return;
  const state   = session.match;
  const card    = byId('profileCard');
  const isMatch = Math.random() < 0.35;

  state.history.push({ profileId: profile.id, action: 'like', index: state.currentProfileIndex });
  state.likes.push(profile.id);
  if (!fromSwipe) card.classList.add('card-swipe-right');

  later('deck', () => {
    if (!fromSwipe) card.classList.remove('card-swipe-right');
    state.currentProfileIndex++;
    writeJSON(KEYS.likes, state.likes);
    loadProfile();
    if (isMatch) {
      state.matchedProfiles.push(profile);
      writeJSON(KEYS.matches, state.matchedProfiles);
      setItem(KEYS.unread, getUnread() + 1);
      updateMatchBadge();
      later('deck', () => showMatchPopup(profile.name), 200);
    }
  }, fromSwipe ? 50 : 500);
}

export function passProfile(fromSwipe = false) {
  const profile = currentProfile();
  if (!profile) return;
  const state = session.match;
  const card  = byId('profileCard');

  state.history.push({ profileId: profile.id, action: 'pass', index: state.currentProfileIndex });
  state.passes.push(profile.id);
  if (!fromSwipe) card.classList.add('card-swipe-left');

  later('deck', () => {
    if (!fromSwipe) card.classList.remove('card-swipe-left');
    state.currentProfileIndex++;
    writeJSON(KEYS.passes, state.passes);
    loadProfile();
  }, fromSwipe ? 50 : 500);
}

export function undoProfile() {
  const state = session.match;
  if (!state.history.length) return;
  const last = state.history.pop();
  state.currentProfileIndex = last.index;
  state.shown = state.shown.filter(id => id !== last.profileId);

  if (last.action === 'like') {
    state.likes = state.likes.filter(id => id !== last.profileId);
    writeJSON(KEYS.likes, state.likes);
  } else {
    state.passes = state.passes.filter(id => id !== last.profileId);
    writeJSON(KEYS.passes, state.passes);
  }

  setDeckVisible(true);
  loadProfile();
}

export function showMatchPopup(name) {
  const popup = byId('matchPopup');
  if (!popup) return;
  byId('matchPopupName').textContent = t('matches.popup.matched', { name });
  popup.querySelector('[data-i18n="matches.popup.title"]').textContent = t('matches.popup.title');
  popup.querySelector('[data-i18n="matches.popup.btn"]').textContent   = t('matches.popup.btn');
  setVisible(popup, true);
  updateStats();
}

export function closeMatchPopup() {
  setVisible(byId('matchPopup'), false);
}

export function updateStats() {
  const state = session.match;
  const l = byId('likesCount');
  const m = byId('matchesCount');
  const s = byId('shownCount');
  if (l) l.textContent = state.likes.length;
  if (m) m.textContent = (state.matchedProfiles || []).length;
  if (s) s.textContent = state.shown.length;
}
