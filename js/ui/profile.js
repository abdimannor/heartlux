// Own profile page: avatar picker, bio and saved preferences.
import { KEYS, getItem, setItem, getUser, readJSON, writeJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h, setVisible } from '../dom.js';
import { AVATAR_OPTIONS } from '../profiles.js';
import { later, cancelScope } from '../timers.js';
import { cropToCard, savePhoto, deletePhoto, photoUrl } from '../photo-store.js';

export const PROMPTS = ['sunday', 'green', 'dinner', 'secret', 'together'];

/** The saved card prompt: { key, answer } or null. */
export function getPrompt() {
  const p = readJSON(KEYS.prompt, null);
  return p && PROMPTS.includes(p.key) && p.answer ? p : null;
}

/** Fill an element with the user's photo, or their emoji avatar when there is none. */
export async function paintOwnAvatar(el, fallback) {
  if (!el) return;
  const url = await photoUrl();
  if (url) {
    el.replaceChildren(h('img', { src: url, alt: t('profile.photo.alt'), className: 'own-photo' }));
    el.classList.add('has-photo');
  } else {
    el.textContent = fallback;
    el.classList.remove('has-photo');
  }
}

const defaultAvatar = gender => (gender === 'female' ? '👩' : gender === 'male' ? '👨' : '😊');

export function loadProfilePage() {
  const user = getUser();
  if (!user || !byId('profileDisplayAvatar')) return;
  const prefs  = readJSON(KEYS.prefs, {});
  const avatar = getItem(KEYS.avatar) || defaultAvatar(user.gender);

  paintOwnAvatar(byId('profileDisplayAvatar'), avatar);
  const prompt = getPrompt();
  byId('profilePromptSelect').value = prompt?.key || PROMPTS[0];
  byId('profilePromptAnswer').value = prompt?.answer || '';
  byId('profileUsername').textContent      = user.username;
  byId('profileEmail').textContent         = user.email;
  byId('profileGender').textContent        = t(`register.gender.${user.gender}`);
  byId('profileBioInput').value            = getItem(KEYS.bio) || '';

  const locale = getLang() === 'en' ? 'en-SE' : 'sv-SE';
  byId('profileMemberSince').textContent = new Date(user.createdAt)
    .toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

  byId('profileLikesCount').textContent   = readJSON(KEYS.likes, []).length;
  byId('profileMatchesCount').textContent = readJSON(KEYS.matches, []).length;

  if (prefs.interest) {
    const unit = t('discover.age.unit');
    const intMap = {
      male:     `👨 ${t('discover.interest.male')}`,
      female:   `👩 ${t('discover.interest.female')}`,
      everyone: `🌍 ${t('discover.interest.everyone')}`,
    };
    byId('profilePrefInterest').textContent = intMap[prefs.interest] || '—';
    byId('profilePrefAge').textContent = (prefs.minAge || prefs.maxAge)
      ? `${prefs.minAge || 18} – ${prefs.maxAge || 80} ${unit}`
      : prefs.age ? `≤ ${prefs.age} ${unit}` : '—';
    byId('profilePrefInterests').textContent = prefs.interests
      ? prefs.interests.map(i => t(`interest.${i}`)).join(', ')
      : '—';
  }

  renderAvatarPicker(avatar);
  renderOwnCard();
}

/** The live preview of your own card: photo, name and prompt answer. */
export async function renderOwnCard() {
  const user = getUser();
  if (!user || !byId('ownCard')) return;
  byId('ownCardName').textContent = user.username;
  const key = byId('profilePromptSelect').value || PROMPTS[0];
  const answer = byId('profilePromptAnswer').value.trim();
  byId('ownCardPromptQ').textContent = t(`prompt.${key}`);
  byId('ownCardPromptA').textContent = answer || '…';
  await paintOwnAvatar(byId('ownCardPhoto'), getItem(KEYS.avatar) || defaultAvatar(user.gender));
  setVisible(byId('profilePhotoRemove'), byId('ownCardPhoto').classList.contains('has-photo'));
}

async function onPhotoChosen(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  const blob = await cropToCard(file);
  await savePhoto(blob);
  const status = byId('profilePhotoStatus');
  status.textContent = t('profile.photo.saved');
  cancelScope('profile:photo');
  later('profile:photo', () => { status.textContent = ''; }, 2500);
  repaintPhotos();
}

export async function removeProfilePhoto() {
  await deletePhoto();
  repaintPhotos();
}

// Only the photos change: unsaved bio and prompt edits stay in their fields.
async function repaintPhotos() {
  const user = getUser();
  await paintOwnAvatar(byId('profileDisplayAvatar'), getItem(KEYS.avatar) || defaultAvatar(user?.gender));
  await renderOwnCard();
}

export function initProfileEditor() {
  byId('profilePhotoInput')?.addEventListener('change', onPhotoChosen);
  byId('profilePromptSelect')?.addEventListener('change', renderOwnCard);
  byId('profilePromptAnswer')?.addEventListener('input', renderOwnCard);
}

function renderAvatarPicker(current) {
  const picker = byId('profileAvatarPicker');
  if (!picker) return;
  picker.replaceChildren(...AVATAR_OPTIONS.map(emoji =>
    h('button', {
      className: 'avatar-option' + (emoji === current ? ' selected' : ''),
      dataset: { action: 'selectAvatar', arg: emoji },
    }, emoji)));
}

export function selectAvatar(button) {
  const emoji = button.dataset.arg;
  button.parentElement.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  setItem(KEYS.avatar, emoji);
  paintOwnAvatar(byId('profileDisplayAvatar'), emoji);
  renderOwnCard();
}

export function saveProfileBio() {
  setItem(KEYS.bio, byId('profileBioInput').value);
  const answer = byId('profilePromptAnswer').value.trim();
  writeJSON(KEYS.prompt, { key: byId('profilePromptSelect').value, answer });
  const msg = byId('profileSaveMsg');
  msg.textContent = t('profile.saved');
  msg.classList.add('show');
  // Restart the hide timer so a second save is not cut short by the first.
  cancelScope('profile:msg');
  later('profile:msg', () => msg.classList.remove('show'), 2000);
}
