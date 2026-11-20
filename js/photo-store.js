// Your own profile photo. It is resized and cropped in the browser and kept in
// IndexedDB on this device only: nothing is ever uploaded anywhere.
const DB = 'heartlux';
const STORE = 'photos';
const KEY = 'me';
export const MAX_SIDE = 800;
export const CARD_RATIO = 3 / 4;   // width / height of the profile card

let cachedUrl = null;

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req?.result ?? null); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** Centre-crop to the card shape and scale so no side exceeds MAX_SIDE. */
export async function cropToCard(file) {
  const bitmap = await createImageBitmap(file);
  let sw = bitmap.width, sh = bitmap.height;
  if (sw / sh > CARD_RATIO) sw = Math.round(sh * CARD_RATIO);
  else sh = Math.round(sw / CARD_RATIO);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);
  const scale = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  canvas.getContext('2d').drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.88));
}

export async function savePhoto(blob) {
  await run('readwrite', s => s.put(blob, KEY));
  resetUrl();
}

export const loadPhoto = () => run('readonly', s => s.get(KEY)).catch(() => null);

export async function deletePhoto() {
  await run('readwrite', s => s.delete(KEY)).catch(() => null);
  resetUrl();
}

function resetUrl() {
  if (cachedUrl) URL.revokeObjectURL(cachedUrl);
  cachedUrl = null;
}

/** An object URL for the stored photo, or null when there is none. */
export async function photoUrl() {
  if (cachedUrl) return cachedUrl;
  const blob = await loadPhoto();
  if (!blob) return null;
  cachedUrl = URL.createObjectURL(blob);
  return cachedUrl;
}
