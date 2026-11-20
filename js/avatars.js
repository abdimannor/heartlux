// Deterministic SVG portraits. The same profile always gets the same face, and
// the look follows the profile's gender, so a "Johan" no longer wears a 👩.
const SKIN  = ['#f6d3b3', '#eab68f', '#d39a6a', '#b07548', '#8a5530', '#5e3a1f'];
const HAIR  = ['#1d1310', '#3b2416', '#6b3f1f', '#a0622d', '#d6a659', '#8c8c8c', '#7a1f2b'];
const SKY   = [['#ff5f8f', '#ffb36b'], ['#7b5cff', '#ff6fb5'], ['#13c2c2', '#6b8cff'], ['#ff7a59', '#ffcf5c'], ['#c04cfd', '#5ce1e6'], ['#ff4d6d', '#8a5cff']];
const SHIRT = ['#2b2d42', '#ef476f', '#118ab2', '#06d6a0', '#ffd166', '#8338ec', '#fb5607'];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const pickFrom = (list, r) => list[Math.floor(r() * list.length)];

/** Pure: the drawing parameters for a profile. Exported for tests. */
export function avatarTraits(profile) {
  const r = rng(hash(`${profile.id}|${profile.name}|${profile.gender}`));
  const female = profile.gender === 'female';
  return {
    female,
    skin:  pickFrom(SKIN, r),
    hair:  pickFrom(HAIR, r),
    sky:   pickFrom(SKY, r),
    shirt: pickFrom(SHIRT, r),
    style: Math.floor(r() * 3),
    beard: !female && r() < 0.35,
    glasses: r() < 0.25,
    smile: 0.6 + r() * 0.8,
  };
}

function hairShapes(t) {
  if (t.female) {
    return [
      // Long straight
      `<path d="M30 60 Q30 22 60 22 Q90 22 90 60 L94 108 Q78 100 74 72 Q60 58 46 72 Q42 100 26 108 Z" fill="${t.hair}"/>`,
      // Curls
      `<g fill="${t.hair}"><circle cx="38" cy="44" r="14"/><circle cx="60" cy="32" r="16"/><circle cx="82" cy="44" r="14"/><circle cx="32" cy="66" r="12"/><circle cx="88" cy="66" r="12"/><circle cx="34" cy="86" r="10"/><circle cx="86" cy="86" r="10"/></g>`,
      // Bun
      `<g fill="${t.hair}"><circle cx="60" cy="18" r="12"/><path d="M33 58 Q32 26 60 26 Q88 26 87 58 Q78 40 60 40 Q42 40 33 58 Z"/></g>`,
    ][t.style];
  }
  return [
    // Short crop
    `<path d="M34 54 Q34 24 60 24 Q86 24 86 54 Q80 38 60 38 Q40 38 34 54 Z" fill="${t.hair}"/>`,
    // Quiff
    `<path d="M34 56 Q30 26 56 20 Q76 14 88 32 Q90 44 86 56 Q82 38 62 36 Q42 36 34 56 Z" fill="${t.hair}"/>`,
    // Buzz
    `<path d="M36 50 Q38 28 60 28 Q82 28 84 50 Q72 40 60 40 Q48 40 36 50 Z" fill="${t.hair}" opacity="0.85"/>`,
  ][t.style];
}

/** SVG markup string. Built only from internal constants, never user text. */
export function avatarSVG(profile, { title } = {}) {
  const t = avatarTraits(profile);
  const id = `av${hash(String(profile.id) + profile.name).toString(36)}`;
  const mouth = 66 + t.smile * 4;
  return `<svg class="gen-avatar" viewBox="0 0 120 120" preserveAspectRatio="xMidYMin slice" role="img" aria-label="${title ? title.replace(/[<>"&]/g, '') : ''}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#${id})"/>
<circle cx="96" cy="22" r="26" fill="#fff" opacity="0.12"/>
${t.female && t.style === 0 ? hairShapes(t) : ''}
<path d="M24 120 Q26 92 60 90 Q94 92 96 120 Z" fill="${t.shirt}"/>
<rect x="53" y="76" width="14" height="16" rx="6" fill="${t.skin}"/>
<ellipse cx="60" cy="58" rx="24" ry="27" fill="${t.skin}"/>
${t.female && t.style === 0 ? '' : hairShapes(t)}
${t.beard ? `<path d="M38 62 Q40 88 60 88 Q80 88 82 62 Q76 76 60 76 Q44 76 38 62 Z" fill="${t.hair}"/>` : ''}
<circle cx="51" cy="58" r="2.6" fill="#1b1b1f"/><circle cx="69" cy="58" r="2.6" fill="#1b1b1f"/>
${t.glasses ? '<g fill="none" stroke="#1b1b1f" stroke-width="2"><circle cx="51" cy="58" r="7"/><circle cx="69" cy="58" r="7"/><path d="M58 58h4"/></g>' : ''}
<path d="M52 ${mouth} Q60 ${mouth + 5 * t.smile} 68 ${mouth}" stroke="#7a2e2e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${t.female ? '<circle cx="44" cy="66" r="4" fill="#ff7a90" opacity="0.35"/><circle cx="76" cy="66" r="4" fill="#ff7a90" opacity="0.35"/>' : ''}
</svg>`;
}

/** Replace an element's emoji avatar with the generated portrait. */
export function paintAvatar(el, profile) {
  if (!el || !profile) return;
  // Profiles without a gender (old saved data) keep their emoji.
  if (profile.gender !== 'male' && profile.gender !== 'female') { el.textContent = profile.avatar || ''; return; }
  const doc = new DOMParser().parseFromString(avatarSVG(profile, { title: profile.name }), 'image/svg+xml');
  el.replaceChildren(document.importNode(doc.documentElement, true));
  el.classList.add('has-gen-avatar');
}
