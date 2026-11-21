// Motion preference. Motion is on by default for every visitor; the navbar
// button turns it off and the choice is remembered. An inline script in
// <head> sets <html data-motion="on|off"> before first paint, and CSS and JS
// read that attribute only.
import { KEYS, getItem, setItem } from './state.js';
import { t } from './i18n.js';


/** True when animations should be skipped right now. */
export function motionReduced() {
  return getItem(KEYS.motion) === 'off';
}

export function syncMotionButton() {
  const btn = document.getElementById('motionBtn');
  if (!btn) return;
  const on = !motionReduced();
  btn.setAttribute('aria-pressed', String(on));
  const label = t(on ? 'nav.motion.pause' : 'nav.motion.play');
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

export function applyMotion() {
  document.documentElement.dataset.motion = motionReduced() ? 'off' : 'on';
  syncMotionButton();
}

export function toggleMotion() {
  setItem(KEYS.motion, motionReduced() ? 'on' : 'off');
  applyMotion();
}
