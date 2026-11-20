// Motion preference. The OS setting (prefers-reduced-motion) is the default;
// an explicit choice from the navbar switch overrides it and is remembered.
// The result lives on <html data-motion="full|reduce"> for CSS and JS alike.
import { KEYS, getItem, setItem } from './state.js';
import { t } from './i18n.js';

const osReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** 'on' | 'off' | null (no choice yet: follow the OS). */
export const motionChoice = () => {
  const v = getItem(KEYS.motion);
  return v === 'on' || v === 'off' ? v : null;
};

/** True when animations should be skipped right now. */
export function motionReduced() {
  const choice = motionChoice();
  if (choice) return choice === 'off';
  return osReduced();
}

export function syncMotionButton() {
  const btn = document.getElementById('motionBtn');
  if (!btn) return;
  const on = !motionReduced();
  btn.setAttribute('aria-pressed', String(on));
  btn.dataset.state = on ? 'on' : 'off';
  btn.querySelector('.motion-label').textContent = t(on ? 'nav.motion.on' : 'nav.motion.off');
  const source = motionChoice() ? '' : ` ${t('nav.motion.system')}`;
  btn.setAttribute('aria-label', `${t(on ? 'nav.motion.labelOn' : 'nav.motion.labelOff')}${source}`);
  btn.title = btn.getAttribute('aria-label');
}

export function applyMotion() {
  document.documentElement.dataset.motion = motionReduced() ? 'reduce' : 'full';
  syncMotionButton();
}

export function toggleMotion() {
  setItem(KEYS.motion, motionReduced() ? 'on' : 'off');
  applyMotion();
}
