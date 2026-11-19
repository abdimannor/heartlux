// Dark mode.
import { KEYS, getItem, setItem } from '../state.js';
import { byId } from '../dom.js';

function syncButton(isDark) {
  const btn = byId('darkModeBtn');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

export function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  setItem(KEYS.dark, isDark ? '1' : '0');
  syncButton(isDark);
}

export function applyDarkMode() {
  const isDark = getItem(KEYS.dark) === '1';
  if (isDark) document.body.classList.add('dark-mode');
  syncButton(isDark);
}
