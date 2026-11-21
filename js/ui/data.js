// "Your data": an inventory of everything this app keeps in this browser,
// read live from localStorage and the photo store, plus export to one JSON
// file, import of that file on another device, and delete everything.
// There is no server: nothing here is ever sent anywhere.
import { KEYS, readJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h } from '../dom.js';
import { loadPhoto, savePhoto, deletePhoto } from '../photo-store.js';

export const SCHEMA = 1;
export const PREFIX = 'heartlux_';
export const MAX_FILE_BYTES = 8 * 1024 * 1024;   // whole export file
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;  // the photo data URL
const NOTICE = 'heartlux_notice';                // one-shot message in sessionStorage
const DB_NAME = 'heartlux';
const CACHE_PREFIX = 'heartlux-';

/** Which keys make up each category on the screen. */
const CATEGORIES = [
  { id: 'profile',  keys: [KEYS.user, KEYS.bio, KEYS.avatar, KEYS.prompt, KEYS.prefs, KEYS.filters],
    count: () => (readJSON(KEYS.user) ? 1 : 0) },
  { id: 'likes',    keys: [KEYS.likes, KEYS.passes, KEYS.interest],
    count: () => readJSON(KEYS.likes, []).length + readJSON(KEYS.passes, []).length },
  { id: 'matches',  keys: [KEYS.matches, KEYS.seen, KEYS.unread],
    count: () => readJSON(KEYS.matches, []).length },
  { id: 'chats',    keys: [KEYS.chats, KEYS.chatRead],
    count: () => Object.values(readJSON(KEYS.chats, {})).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0) },
  { id: 'safety',   keys: [KEYS.blocked, KEYS.reports],
    count: () => readJSON(KEYS.blocked, []).length + readJSON(KEYS.reports, []).length },
  { id: 'settings', keys: [KEYS.lang, KEYS.dark, KEYS.motion],
    count: () => [KEYS.lang, KEYS.dark, KEYS.motion].filter(k => localStorage.getItem(k) !== null).length },
];

const bytes = text => new Blob([text]).size;
const kb = n => (n === 0 ? '0' : Math.max(0.1, n / 1024)
  .toLocaleString(getLang() === 'en' ? 'en-GB' : 'sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

/** Every key this app owns in localStorage (the origin may be shared with other sites). */
export const ownKeys = () => Object.keys(localStorage).filter(k => k.startsWith(PREFIX));

/** Live inventory: [{ id, count, bytes }] including the photo and any unknown keys. */
export async function inventory() {
  const known = new Set(CATEGORIES.flatMap(c => c.keys));
  const size = keys => keys.reduce((n, k) => {
    const v = localStorage.getItem(k);
    return v === null ? n : n + bytes(k) + bytes(v);
  }, 0);
  const rows = CATEGORIES.map(c => ({ id: c.id, count: c.count(), bytes: size(c.keys) }));
  const photo = await loadPhoto();
  rows.push({ id: 'photo', count: photo ? 1 : 0, bytes: photo?.size || 0 });
  const other = ownKeys().filter(k => !known.has(k));
  if (other.length) rows.push({ id: 'other', count: other.length, bytes: size(other) });
  return rows;
}

export async function renderDataPage() {
  const list = byId('dataInventory');
  if (!list) return;
  const rows = await inventory();
  list.replaceChildren(...rows.map(r => h('li', { className: 'data-row', dataset: { category: r.id } },
    h('span', { className: 'data-row-name' }, t(`data.cat.${r.id}`)),
    h('span', { className: 'data-row-count' }, t(`data.count.${r.id}`).replace('{n}', r.count)),
    h('span', { className: 'data-row-size' }, t('data.size').replace('{kb}', kb(r.bytes))))));
  const total = rows.reduce((n, r) => n + r.bytes, 0);
  byId('dataTotal').textContent = t('data.total').replace('{kb}', kb(total));
  status('');
  const notice = sessionStorage.getItem(NOTICE);
  if (notice) {
    sessionStorage.removeItem(NOTICE);
    status(t(notice));
  }
}

function status(text, isError = false) {
  const el = byId('dataStatus');
  el.textContent = text;
  el.classList.toggle('data-status--error', isError);
}

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

/** The complete export object (versioned). */
export async function buildExport() {
  const storage = {};
  ownKeys().filter(k => Object.hasOwn(VALUE_CHECKS, k)).sort().forEach(k => { storage[k] = localStorage.getItem(k); });
  const photo = await loadPhoto();
  return {
    app: 'heartlux',
    schema: SCHEMA,
    exportedAt: new Date().toISOString(),
    storage,
    photo: photo ? await blobToDataUrl(photo) : null,
  };
}

export async function exportData() {
  const data = await buildExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: `heartlux-${data.exportedAt.slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  status(t('data.export.done'));
}

const text_ = v => typeof v === 'string';
const json = v => { try { return { ok: true, value: JSON.parse(v) }; } catch { return { ok: false }; } };
const isObject = v => !!v && typeof v === 'object' && !Array.isArray(v);
const optional = (o, field, type) => o[field] === undefined || typeof o[field] === type;

/** The only keys an import may write, each with a check of its stored value. */
const VALUE_CHECKS = {
  [KEYS.user]: v => { const r = json(v); const u = r.value;
    return r.ok && isObject(u) && typeof u.username === 'string' && u.username.trim() !== ''
      && ['email', 'password', 'gender', 'createdAt'].every(f => optional(u, f, 'string')) && optional(u, 'demo', 'boolean'); },
  [KEYS.prefs]:    v => { const r = json(v); return r.ok && isObject(r.value); },
  [KEYS.filters]:  v => { const r = json(v); return r.ok && isObject(r.value); },
  [KEYS.chatRead]: v => { const r = json(v); return r.ok && isObject(r.value); },
  [KEYS.prompt]:   v => { const r = json(v); return r.ok && isObject(r.value); },
  [KEYS.chats]:    v => { const r = json(v); return r.ok && isObject(r.value) && Object.values(r.value).every(Array.isArray); },
  [KEYS.likes]:    v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.passes]:   v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.matches]:  v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.seen]:     v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.blocked]:  v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.reports]:  v => { const r = json(v); return r.ok && Array.isArray(r.value); },
  [KEYS.avatar]:   text_,
  [KEYS.bio]:      text_,
  [KEYS.interest]: text_,
  [KEYS.unread]:   v => /^\d{1,6}$/.test(v),
  [KEYS.lang]:     v => v === 'sv' || v === 'en',
  [KEYS.dark]:     v => v === '0' || v === '1',
  [KEYS.motion]:   v => v === 'on' || v === 'off',
};

const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]*={0,2})$/;

/** Check an export file. Returns { ok, data } or { ok: false, error: i18n key }. */
export function validateExport(text, fileSize = bytes(text)) {
  if (fileSize > MAX_FILE_BYTES) return { ok: false, error: 'data.import.error.size' };
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, error: 'data.import.error.json' }; }
  if (!isObject(data) || data.app !== 'heartlux') return { ok: false, error: 'data.import.error.app' };
  if (data.schema !== SCHEMA) return { ok: false, error: 'data.import.error.schema' };
  const s = data.storage;
  if (!isObject(s)) return { ok: false, error: 'data.import.error.app' };
  for (const [k, v] of Object.entries(s)) {
    if (!Object.hasOwn(VALUE_CHECKS, k)) return { ok: false, error: 'data.import.error.key' };
    if (typeof v !== 'string' || !VALUE_CHECKS[k](v)) return { ok: false, error: 'data.import.error.value' };
  }
  if (!s[KEYS.user]) return { ok: false, error: 'data.import.error.noprofile' };
  if (data.photo !== null && data.photo !== undefined) {
    if (typeof data.photo !== 'string') return { ok: false, error: 'data.import.error.photo' };
    if (data.photo.length > MAX_PHOTO_BYTES) return { ok: false, error: 'data.import.error.size' };
    const m = PHOTO_RE.exec(data.photo);
    if (!m || m[2].length === 0 || m[2].length % 4 !== 0) return { ok: false, error: 'data.import.error.photo' };
  }
  return { ok: true, data };
}

const SIGNATURES = {
  jpeg: b => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  png:  b => [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A].every((x, i) => b[i] === x),
  webp: b => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
};

/**
 * Decode the photo of a validated export into a Blob, and make sure the
 * browser can really draw it. Throws if anything is wrong; touches no storage.
 */
export async function decodePhoto(dataUrl) {
  const m = PHOTO_RE.exec(dataUrl || '');
  if (!m) throw new Error('photo');
  const binary = atob(m[2]);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  if (buf.length < 12 || !SIGNATURES[m[1]](buf)) throw new Error('photo');
  const blob = new Blob([buf], { type: `image/${m[1]}` });
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    if (!bitmap.width || !bitmap.height) throw new Error('photo');
    bitmap.close?.();
  }
  return blob;
}

/** Short summary of what a file holds, for the confirm dialog. */
function summarise(data) {
  const s = data.storage;
  const parse = (k, fb) => { try { return JSON.parse(s[k]) ?? fb; } catch { return fb; } };
  const chats = Object.values(parse(KEYS.chats, {})).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
  return t('data.import.summary')
    .replace('{name}', parse(KEYS.user, {}).username || '?')
    .replace('{matches}', parse(KEYS.matches, []).length)
    .replace('{messages}', chats)
    .replace('{photo}', data.photo ? t('data.import.photo.yes') : t('data.import.photo.no'));
}

let pending = null;

async function onImportFile(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  const result = validateExport(await file.text(), file.size);
  if (!result.ok) { status(t(result.error), true); return; }
  let photo = null;
  if (result.data.photo) {
    try { photo = await decodePhoto(result.data.photo); } catch { status(t('data.import.error.photo'), true); return; }
  }
  pending = { data: result.data, photo };
  byId('importSummary').textContent = summarise(result.data);
  const current = (await inventory()).filter(r => r.count > 0).map(r => t(`data.cat.${r.id}`).toLowerCase());
  byId('importReplaces').textContent = current.length
    ? t('data.import.replaces').replace('{list}', current.join(', '))
    : t('data.import.replaces.none');
  byId('importDialog').showModal();
}

function reloadTo(hash, notice) {
  sessionStorage.setItem(NOTICE, notice);
  history.replaceState(null, '', `#${hash}`);
  location.reload();
}

/**
 * Replace this app's data with a validated export. The photo is decoded before
 * anything is touched; if any write fails, the previous keys and photo are put
 * back and the error is thrown on.
 */
export async function applyImport(data, photo) {
  if (data.photo && !photo) photo = await decodePhoto(data.photo);
  const snapshot = Object.fromEntries(ownKeys().map(k => [k, localStorage.getItem(k)]));
  const oldPhoto = await loadPhoto();
  try {
    ownKeys().forEach(k => localStorage.removeItem(k));
    Object.entries(data.storage).forEach(([k, v]) => localStorage.setItem(k, v));
    if (photo) await savePhoto(photo);
    else await deletePhoto();
  } catch (err) {
    ownKeys().forEach(k => localStorage.removeItem(k));
    Object.entries(snapshot).forEach(([k, v]) => localStorage.setItem(k, v));
    try { if (oldPhoto) await savePhoto(oldPhoto); else await deletePhoto(); } catch { /* keys are back; the photo store itself is failing */ }
    throw err;
  }
}

/** Remove every key, the photo database, the offline caches and the service worker of this app. */
export async function wipeEverything() {
  ownKeys().forEach(k => localStorage.removeItem(k));
  Object.keys(sessionStorage).filter(k => k.startsWith(PREFIX)).forEach(k => sessionStorage.removeItem(k));
  await new Promise(resolve => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  if (window.caches) {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k)));
  }
  if (navigator.serviceWorker?.getRegistrations) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  }
}

export function initDataPage() {
  byId('dataImportInput')?.addEventListener('change', onImportFile);
  byId('importDialog')?.addEventListener('close', async event => {
    const dialog = event.currentTarget;
    const job = pending;
    pending = null;
    if (dialog.returnValue !== 'ok' || !job) { byId('dataImportInput')?.focus(); return; }
    try {
      await applyImport(job.data, job.photo);
    } catch {
      status(t('data.import.error.write'), true);
      byId('dataImportInput')?.focus();
      return;
    }
    reloadTo('data', 'data.import.done');
  });
  byId('wipeDialog')?.addEventListener('close', async event => {
    if (event.currentTarget.returnValue !== 'ok') { byId('dataWipeButton')?.focus(); return; }
    try {
      await wipeEverything();
    } catch {
      status(t('data.wipe.error'), true);
      return;
    }
    history.replaceState(null, '', location.pathname);
    location.reload();
  });
}

export function openWipeDialog() {
  byId('wipeDialog').showModal();
}
