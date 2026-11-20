// Swipe physics for the profile card: Pointer Events drag with rotation,
// velocity-based fling, a spring back, a stacked deck behind the card and
// arrow-key shortcuts. Transforms are live per-frame values, so they stay as
// style properties rather than classes.
import { byId, h } from '../dom.js';
import { t } from '../i18n.js';
import { currentProfile, likeProfile, passProfile } from './matches.js';
import { later } from '../timers.js';

let initialized = false;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DISTANCE = 110;   // px past which a release always commits
const FLING    = 0.55;  // px/ms release speed that commits a shorter drag

function setIndicators(likeOpacity, passOpacity) {
  const like = byId('swipeLike');
  const pass = byId('swipePass');
  if (like) like.style.opacity = likeOpacity;
  if (pass) pass.style.opacity = passOpacity;
}

function setDeckProgress(p) {
  document.querySelector('.deck')?.style.setProperty('--deck-progress', String(Math.min(Math.abs(p), 1)));
}

function buildDeck(card) {
  if (card.parentElement.classList.contains('deck')) return;
  const deck = h('div', { className: 'deck' },
    h('div', { className: 'deck-ghost deck-ghost-2', 'aria-hidden': 'true' }),
    h('div', { className: 'deck-ghost deck-ghost-1', 'aria-hidden': 'true' }));
  card.before(deck);
  deck.append(card);
}

function buildHint() {
  const buttons = byId('actionButtons');
  if (!buttons) return;
  renderHint();
}

export function renderHint() {
  const hint = byId('swipeKeyHint');
  if (!hint) return;
  hint.replaceChildren(
    h('kbd', {}, '\u2190'), ` ${t('swipe.pass')}`,
    h('span', { className: 'swipe-key-sep', 'aria-hidden': 'true' }, '\u00b7'),
    `${t('swipe.like')} `, h('kbd', {}, '\u2192'));
}

/** Throw the card off screen, carrying the release velocity. */
export function flyOut(card, direction, done, velocity = 0) {
  setIndicators(direction > 0 ? 1 : 0, direction < 0 ? 1 : 0);
  if (reducedMotion()) {
    setIndicators(0, 0);
    done(true);
    return;
  }
  const speed    = Math.max(Math.abs(velocity), 1.2);
  const duration = Math.round(Math.min(420, Math.max(220, 900 / speed)));
  const x        = (window.innerWidth * 0.75 + 240) * direction;
  card.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity ${duration}ms ease`;
  card.style.transform  = `translate(${x}px, -40px) rotate(${30 * direction}deg)`;
  card.style.opacity    = '0';
  setDeckProgress(1);
  later('deck', () => {
    card.style.transition = 'none';
    card.style.transform  = '';
    card.style.opacity    = '';
    setIndicators(0, 0);
    setDeckProgress(0);
    done(true);
    void card.offsetWidth;
    card.style.transition = '';
  }, duration);
}

function springBack(card) {
  card.style.transition = reducedMotion() ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
  card.style.transform  = '';
  setDeckProgress(0);
  later('deck', () => { card.style.transition = ''; }, 500);
}

const isOpen = id => { const el = byId(id); return el && !el.classList.contains('is-hidden'); };

export function initSwipeGesture() {
  if (initialized) return;
  const card = byId('profileCard');
  if (!card) return;
  initialized = true;

  buildDeck(card);
  buildHint();

  let drag = null;
  let busy = false;
  const commit = (dir, v) => {
    busy = true;
    flyOut(card, dir, fromSwipe => {
      busy = false;
      (dir > 0 ? likeProfile : passProfile)(fromSwipe);
    }, v);
  };

  card.addEventListener('pointerdown', e => {
    if (!currentProfile() || busy || e.button > 0) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, samples: [{ x: e.clientX, t: e.timeStamp }] };
    card.setPointerCapture?.(e.pointerId);
    card.style.transition = 'none';
    card.classList.add('is-dragging');
  });

  card.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x0;
    drag.dy = e.clientY - drag.y0;
    drag.samples.push({ x: e.clientX, t: e.timeStamp });
    if (drag.samples.length > 6) drag.samples.shift();
    card.style.transform = `translate(${drag.dx}px, ${drag.dy * 0.25}px) rotate(${drag.dx * 0.06}deg)`;
    const p = drag.dx / DISTANCE;
    setIndicators(Math.max(0, Math.min(p, 1)), Math.max(0, Math.min(-p, 1)));
    setDeckProgress(p);
  });

  const release = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const { dx, samples } = drag;
    drag = null;
    card.classList.remove('is-dragging');
    const first = samples[0];
    const last  = samples[samples.length - 1];
    const v     = (last.x - first.x) / Math.max(last.t - first.t, 1);
    const flung = Math.abs(v) > FLING && Math.sign(v) === Math.sign(dx) && Math.abs(dx) > 30;
    if (Math.abs(dx) > DISTANCE || flung) commit(Math.sign(dx), v);
    else { setIndicators(0, 0); springBack(card); }
  };
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);

  document.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!byId('matches')?.classList.contains('active')) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    if (isOpen('chatModal') || isOpen('matchPopup')) return;
    if (!currentProfile() || busy) return;
    e.preventDefault();
    commit(e.key === 'ArrowRight' ? 1 : -1, 1.6);
  });
}
