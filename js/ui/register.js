// Register / login forms, the auth tabs, interest option cards and age sliders.
import { KEYS, getItem, setItem, getUser, getPrefs, writeJSON } from '../state.js';
import { t } from '../i18n.js';
import { byId, setVisible } from '../dom.js';
import { showPage, updateNavbar } from './navigation.js';
import { later } from '../timers.js';

export function switchAuthTab(tab) {
  const isReg = tab === 'register';
  setVisible(byId('sectionRegister'), isReg);
  setVisible(byId('sectionLogin'), !isReg);
  byId('tabRegister').classList.toggle('active', isReg);
  byId('tabLogin').classList.toggle('active', !isReg);
  if (!isReg) setVisible(byId('authGate'), false);
}

export function updateAgeRangeDisplay() {
  const minEl  = byId('ageMin');
  const maxEl  = byId('ageMax');
  const dispEl = byId('ageRangeDisplay');
  if (!minEl || !maxEl || !dispEl) return;
  dispEl.textContent = `${minEl.value} – ${maxEl.value} ${t('discover.age.unit')}`;
}

/** Keep min below max while either slider moves. */
export function initAgeRange() {
  const minEl = byId('ageMin');
  const maxEl = byId('ageMax');
  if (!minEl || !maxEl) return;
  minEl.addEventListener('input', () => {
    if (parseInt(minEl.value, 10) >= parseInt(maxEl.value, 10))
      minEl.value = parseInt(maxEl.value, 10) - 1;
    updateAgeRangeDisplay();
  });
  maxEl.addEventListener('input', () => {
    if (parseInt(maxEl.value, 10) <= parseInt(minEl.value, 10))
      maxEl.value = parseInt(minEl.value, 10) + 1;
    updateAgeRangeDisplay();
  });
}

export function selectOption(card) {
  card.parentElement.querySelectorAll('.option-card')
    .forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  setItem(`heartlux_${card.dataset.category}`, card.dataset.value);
}

export function restoreInterestSelection() {
  const stored = getItem(KEYS.interest);
  if (!stored) return;
  document.querySelectorAll('.option-card[data-value]').forEach(card => {
    if (card.dataset.value === stored) card.classList.add('selected');
  });
}

export function handleRegister(event) {
  event.preventDefault();

  const username        = byId('username').value;
  const email           = byId('email').value;
  const password        = byId('password').value;
  const confirmPassword = byId('confirmPassword').value;
  const gender          = document.querySelector('input[name="gender"]:checked').value;

  if (password.length < 8) { alert(t('register.alert.password.length')); return; }
  if (password !== confirmPassword) { alert(t('register.alert.password.match')); return; }

  writeJSON(KEYS.user, { username, email, password, gender, createdAt: new Date().toISOString() });

  const form    = byId('registerForm');
  const success = byId('successMessage');
  setVisible(form, false);
  success.textContent = t('register.success');
  success.classList.add('show');

  later('auth', () => {
    setVisible(form, true);
    success.classList.remove('show');
    form.reset();
    updateNavbar();
    // Only redirect if the user is still on the sign-up page.
    if (byId('register')?.classList.contains('active')) showPage('discover');
  }, 2000);
}

export function handleLogin(event) {
  event.preventDefault();
  const identifier = byId('loginIdentifier').value.trim().toLowerCase();
  const password   = byId('loginPassword').value;
  const stored     = getUser();

  if (!stored) { alert(t('login.alert.notfound')); return; }

  const valid = (identifier === stored.email.toLowerCase() || identifier === stored.username.toLowerCase())
             && password === stored.password;
  if (!valid) { alert(t('login.alert.invalid')); return; }

  const successEl = byId('loginSuccess');
  successEl.textContent = t('login.success', { name: stored.username });
  successEl.classList.add('show');

  later('auth', () => {
    successEl.classList.remove('show');
    byId('loginForm').reset();
    updateNavbar();
    if (byId('register')?.classList.contains('active')) showPage(getPrefs() ? 'matches' : 'discover');
  }, 1500);
}
