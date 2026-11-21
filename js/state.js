// Storage keys, localStorage access and the in-memory session state.
import { deletePhoto } from './photo-store.js';

export const KEYS = Object.freeze({
  user:      'heartlux_user',
  prefs:     'heartlux_preferences',
  likes:     'heartlux_likes',
  passes:    'heartlux_passes',
  interest:  'heartlux_interest',
  matches:   'heartlux_matches_list',
  chats:     'heartlux_chats',
  avatar:    'heartlux_user_avatar',
  bio:       'heartlux_user_bio',
  unread:    'heartlux_unread',
  seen:      'heartlux_seen_matches',
  lang:      'heartlux_lang',
  dark:      'heartlux_dark',
  motion:    'heartlux_motion',
  prompt:    'heartlux_user_prompt',
  filters:   'heartlux_filters',
  chatRead:  'heartlux_chat_read',
  blocked:   'heartlux_blocked',
  reports:   'heartlux_reports',
});

/** Everything that belongs to one local account (cleared on logout / demo). */
export const USER_STORAGE_KEYS = [
  KEYS.user, KEYS.prefs, KEYS.likes, KEYS.passes,
  KEYS.interest, KEYS.matches, KEYS.chats,
  KEYS.avatar, KEYS.bio, KEYS.prompt, KEYS.filters,
  KEYS.unread, KEYS.seen, KEYS.chatRead,
  KEYS.blocked, KEYS.reports,
];

export const getItem    = key => localStorage.getItem(key);
export const setItem    = (key, value) => localStorage.setItem(key, String(value));
export const removeItem = key => localStorage.removeItem(key);

export function readJSON(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearUserData() {
  USER_STORAGE_KEYS.forEach(removeItem);
  deletePhoto();
}

/** Ids of profiles you have blocked; they never show in Discover again. */
export const blockedIds = () => new Set(readJSON(KEYS.blocked, []).map(b => String(b.id)));

export const getUser  = () => readJSON(KEYS.user);
export const getPrefs = () => readJSON(KEYS.prefs);
export const getUnread = () => parseInt(getItem(KEYS.unread) || '0', 10);

/** Remember when a conversation was last read (for the unread dot). */
export function markChatRead(pid) {
  const read = readJSON(KEYS.chatRead, {});
  read[pid] = Date.now();
  writeJSON(KEYS.chatRead, read);
}

/** A conversation is unread when its newest message is from the match and arrived after you last read it. */
export function isChatUnread(pid) {
  const last = (readJSON(KEYS.chats, {})[pid] || []).at(-1);
  if (!last || last.from === 'user') return false;
  return (last.ts || 0) > (readJSON(KEYS.chatRead, {})[pid] || 0);
}

export function emptyMatchState() {
  return {
    currentProfileIndex: 0,
    allProfiles: [],
    profiles: [],
    likes: [],
    passes: [],
    shown: [],
    history: [],
    matchedProfiles: [],
  };
}

/** Mutable session state shared by the views. */
export const session = {
  match: emptyMatchState(),
  chatProfile: null,
  typing: new Set(),   // conversation ids where the match is typing
};

export function resetMatchState(overrides = {}) {
  session.match = { ...emptyMatchState(), ...overrides };
}
