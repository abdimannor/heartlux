// Dark mode.
import { KEYS, getItem, setItem } from '../state.js';
import { byId } from '../dom.js';

// Browser chrome / installed-app title bar follows the in-app theme.
const THEME_COLOR = { light: '#cc328c', dark: '#140c1b' };

function syncButton(isDark) {
  const btn = byId('darkModeBtn');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? THEME_COLOR.dark : THEME_COLOR.light);
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
