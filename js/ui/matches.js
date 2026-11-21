// Browse tab: the profile card deck, like / pass / undo, match popup and stats.
import { KEYS, session, readJSON, writeJSON, getPrefs, getUnread, setItem, resetMatchState, blockedIds } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { generateProfiles, matchProfiles, sharedInterests, applyFilters, activeFilterCount } from '../profiles.js';
import { getFilters } from './filters.js';
import { updateMatchBadge } from './navigation.js';
import { initSwipeGesture } from './swipe.js';
import { later } from '../timers.js';
import { paintAvatar } from '../avatars.js';
import { heartBurst } from './match-burst.js';

export { showMatchesTab } from './matches-list.js';

function setDeckVisible(hasProfile) {
  const state       = session.match;
  const filteredOut = !hasProfile && state.allProfiles.length > 0
    && state.profiles.length === 0 && activeFilterCount(getFilters()) > 0;
  setVisible(byId('profileCard'), hasProfile);
  setVisible(byId('actionButtons'), hasProfile);
  setVisible(byId('noMoreProfiles'), !hasProfile && !filteredOut);
  setVisible(byId('noFilterMatch'), filteredOut);
}

/** Re-deal the deck after a filter change, skipping profiles already acted on. */
export function refilterDeck() {
  const state = session.match;
  if (!state.allProfiles.length) return;
  const acted = new Set(state.history.map(h => h.profileId));
  const blocked = blockedIds();
  state.allProfiles = state.allProfiles.filter(p => !blocked.has(String(p.id)));
  state.profiles = applyFilters(state.allProfiles, getFilters()).filter(p => !acted.has(p.id));
  state.currentProfileIndex = 0;
  state.history = [];
  loadProfile();
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
    const blocked         = blockedIds();
    state.allProfiles     = matchProfiles(generateProfiles(getLang()), prefs).filter(p => !blocked.has(String(p.id)));
    state.profiles        = applyFilters(state.allProfiles, getFilters());
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

/** Speak the result of a like or pass to screen readers through the deck's live region. */
function announce(text) {
  const live = byId('deckStatus');
  if (!live) return;
  const next = currentProfile();
  live.textContent = `${text} ${next ? t('swipe.said.next', { name: `${next.name}, ${next.age}` }) : t('swipe.said.empty')}`;
}

/** Full profile in a native dialog (the Up arrow on Discover). */
export function openProfileDetails() {
  const profile = currentProfile();
  const dialog = byId('detailsDialog');
  if (!profile || !dialog || dialog.open) return;
  byId('detailsName').textContent = `${profile.name}, ${profile.age}`;
  byId('detailsCity').textContent = `📍 ${profile.city}`;
  byId('detailsBio').textContent = profile.bio;
  const prompt = byId('detailsPrompt');
  prompt.textContent = profile.prompt ? `${t(`prompt.${profile.prompt.key}`)} ${profile.prompt.answer}` : '';
  setVisible(prompt, Boolean(profile.prompt));
  byId('detailsInterests').replaceChildren(...profile.interests.map(i => h('li', {}, t(`interest.${i}`))));
  const opener = document.activeElement;
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); }, { once: true });
  dialog.showModal();
}

export function loadProfile() {
  const profile = currentProfile();
  setDeckVisible(Boolean(profile));
  if (!profile) return;

  byId('cardName').textContent     = `${profile.name}, ${profile.age}`;
  byId('cardLocation').textContent = `📍 ${profile.city}`;
  byId('cardBio').textContent      = profile.bio;
  paintAvatar(byId('cardAvatar'), profile);

  const promptEl = byId('cardPrompt');
  if (promptEl) {
    if (profile.prompt) {
      byId('cardPromptQ').textContent = t(`prompt.${profile.prompt.key}`);
      byId('cardPromptA').textContent = profile.prompt.answer;
    }
    setVisible(promptEl, Boolean(profile.prompt));
  }

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
    announce(t(isMatch ? 'swipe.said.match' : 'swipe.said.like', { name: profile.name }));
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
    announce(t('swipe.said.pass', { name: profile.name }));
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
  heartBurst(popup);
  popup.querySelector('[data-action="closeMatchPopup"]')?.focus();
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
