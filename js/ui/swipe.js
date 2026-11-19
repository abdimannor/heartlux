// Drag / touch swipe on the profile card. Transforms are live per-frame values,
// so they stay as style properties rather than classes.
import { byId } from '../dom.js';
import { currentProfile, likeProfile, passProfile } from './matches.js';

let initialized = false;

const getX = e => (e.touches ? e.touches[0].clientX : e.clientX);

function setIndicators(likeOpacity, passOpacity) {
  const like = byId('swipeLike');
  const pass = byId('swipePass');
  if (like) like.style.opacity = likeOpacity;
  if (pass) pass.style.opacity = passOpacity;
}

function flyOut(card, direction, done) {
  card.style.transition = 'transform 0.38s ease, opacity 0.38s ease';
  card.style.transform  = `translateX(${700 * direction}px) rotate(${28 * direction}deg)`;
  card.style.opacity    = '0';
  setTimeout(() => {
    card.style.transition = '';
    card.style.transform  = '';
    card.style.opacity    = '';
    done(true);
  }, 370);
}

export function initSwipeGesture() {
  if (initialized) return;
  initialized = true;

  const card = byId('profileCard');
  if (!card) return;

  let startX = 0, currentX = 0, isDragging = false;

  function onStart(e) {
    if (!currentProfile()) return;
    isDragging = true;
    startX = getX(e);
    currentX = 0;
    card.style.transition = 'none';
  }

  function onMove(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    currentX = getX(e) - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.07}deg)`;
    if (currentX > 20)       setIndicators(Math.min((currentX - 20) / 80, 1), 0);
    else if (currentX < -20) setIndicators(0, Math.min((-currentX - 20) / 80, 1));
    else                     setIndicators(0, 0);
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    setIndicators(0, 0);

    if (currentX > 100) flyOut(card, 1, likeProfile);
    else if (currentX < -100) flyOut(card, -1, passProfile);
    else {
      card.style.transition = 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.transform  = '';
      setTimeout(() => { card.style.transition = ''; }, 320);
    }
    currentX = 0;
  }

  card.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  card.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}
