// Own profile page: avatar picker, bio and saved preferences.
import { KEYS, getItem, setItem, getUser, readJSON } from '../state.js';
import { t, getLang } from '../i18n.js';
import { byId, h } from '../dom.js';
import { AVATAR_OPTIONS } from '../profiles.js';
import { later, cancelScope } from '../timers.js';

const defaultAvatar = gender => (gender === 'female' ? '👩' : gender === 'male' ? '👨' : '😊');

export function loadProfilePage() {
  const user = getUser();
  if (!user || !byId('profileDisplayAvatar')) return;
  const prefs  = readJSON(KEYS.prefs, {});
  const avatar = getItem(KEYS.avatar) || defaultAvatar(user.gender);

  byId('profileDisplayAvatar').textContent = avatar;
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
  byId('profileDisplayAvatar').textContent = emoji;
  setItem(KEYS.avatar, emoji);
}

export function saveProfileBio() {
  setItem(KEYS.bio, byId('profileBioInput').value);
  const msg = byId('profileSaveMsg');
  msg.textContent = t('profile.saved');
  msg.classList.add('show');
  // Restart the hide timer so a second save is not cut short by the first.
  cancelScope('profile:msg');
  later('profile:msg', () => msg.classList.remove('show'), 2000);
}
