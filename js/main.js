// ─── i18n ─────────────────────────────────────────────────────────────────

const translations = {
  sv: {
    'nav.home':     'Hem',
    'nav.discover': 'Utforska',
    'nav.matches':  'Matchningar',
    'nav.join':     'Gå med',
    'nav.hello':    'Hej',
    'nav.logout':   'Logga ut',

    'hero.tagline':      'Där meningsfulla kontakter skapas. Möt människor som verkligen förstår dig.',
    'hero.description':  'Hitta genuina kontakter baserat på gemensamma intressen och värderingar.',
    'hero.cta.discover': 'Börja Utforska',
    'hero.cta.register': 'Skapa Konto',

    'register.title':                 '❤️ Gå med i Heartlux',
    'register.subtitle':              'Skapa ett konto och börja hitta meningsfulla kontakter',
    'register.username':              'Användarnamn',
    'register.username.placeholder':  'Välj ditt användarnamn',
    'register.email':                 'E-postadress',
    'register.email.placeholder':     'din@email.com',
    'register.password':              'Lösenord',
    'register.password.placeholder':  'Minst 8 tecken',
    'register.confirm':               'Bekräfta Lösenord',
    'register.confirm.placeholder':   'Bekräfta ditt lösenord',
    'register.gender':                'Välj kön',
    'register.gender.male':           'Man',
    'register.gender.female':         'Kvinna',
    'register.gender.other':          'Annat',
    'register.submit':                'Skapa Konto',
    'register.success':               '✓ Välkommen till Heartlux! Ditt konto är nu skapat.',
    'register.login':                 'Redan medlem?',
    'register.login.link':            'Logga in',
    'register.alert.password.length': 'Lösenordet måste vara minst 8 tecken långt',
    'register.alert.password.match':  'Lösenorden matchar inte',

    'discover.title':               '🎀 Vad letar du efter?',
    'discover.subtitle':            'Berätta lite om dig själv för att hitta den perfekta matchen.',
    'discover.interest.heading':    'Jag är intresserad av att möta',
    'discover.interest.male':       'Män',
    'discover.interest.male.desc':  'Anslut med manliga användare',
    'discover.interest.female':     'Kvinnor',
    'discover.interest.female.desc':'Anslut med kvinnliga användare',
    'discover.interest.everyone':   'Öppen för alla',
    'discover.interest.everyone.desc': 'Anslut med vem som helst',
    'discover.age.heading':         'Åldersintervall',
    'discover.age.unit':            'år',
    'discover.interests.heading':   'Mina intressen',
    'discover.back':                '← Tillbaka',
    'discover.finish':              'Slutför Profilen',
    'discover.alert.interest':      'Välj vem du vill möta',
    'discover.alert.interests':     'Välj minst ett intresse',

    'interest.travel':  '✈️ Resor',
    'interest.music':   '🎵 Musik',
    'interest.fitness': '💪 Fitness',
    'interest.cooking': '🍳 Mat',
    'interest.books':   '📚 Böcker',
    'interest.art':     '🎨 Konst',

    'matches.stat.likes':    'Antal Likes',
    'matches.stat.matches':  'Matchningar',
    'matches.stat.shown':    'Visade',
    'matches.undo':          '↩ Ångra',
    'matches.pass':          'Passa',
    'matches.like':          '❤️ Gilla',
    'matches.empty.title':   'Du har visat alla profiler!',
    'matches.empty.text':    'Kom tillbaka senare för fler anslutningar.',
    'matches.empty.back':    'Tillbaka till Startsidan',
    'matches.noprofile.title': 'Sätt upp din profil',
    'matches.noprofile.text':  'Ange dina preferenser för att börja bläddra profiler.',
    'matches.noprofile.btn':   'Ange Preferenser',
    'matches.footer.home':   '← Hem',
    'matches.popup.title':   'Det är en match!',
    'matches.popup.matched': 'Du och {name} matchade!',
    'matches.popup.btn':     'Fortsätt Bläddra ❤️',

    'setup.done.title': 'Profilen är klar!',
    'setup.done.text':  'Dags att utforska matchningar...',

    'footer.privacy': 'Integritet',
    'footer.terms':   'Användarvillkor',

    'auth.tab.register': 'Skapa konto',
    'auth.tab.login':    'Logga in',
    'auth.gate':         '🔒 Du behöver ett konto för att fortsätta. Registrera dig eller logga in nedan.',

    'login.title':                  '❤️ Logga in på Heartlux',
    'login.subtitle':               'Välkommen tillbaka!',
    'login.identifier':             'E-post eller användarnamn',
    'login.identifier.placeholder': 'din@email.com',
    'login.password':               'Lösenord',
    'login.password.placeholder':   'Ditt lösenord',
    'login.submit':                 'Logga in',
    'login.register':               'Inte registrerad?',
    'login.register.link':          'Skapa konto',
    'login.success':                '✓ Välkommen tillbaka, {name}!',
    'login.alert.notfound':         'Inget konto hittades. Registrera dig först.',
    'login.alert.invalid':          'Fel e-post/användarnamn eller lösenord.',
  },
  en: {
    'nav.home':     'Home',
    'nav.discover': 'Discover',
    'nav.matches':  'Matches',
    'nav.join':     'Join',
    'nav.hello':    'Hi',
    'nav.logout':   'Log out',

    'hero.tagline':      'Where meaningful connections flow. Meet people who truly get you.',
    'hero.description':  'Discover genuine connections based on shared interests and values.',
    'hero.cta.discover': 'Start Discovering',
    'hero.cta.register': 'Create Account',

    'register.title':                 '❤️ Join Heartlux',
    'register.subtitle':              'Create an account and start finding meaningful connections',
    'register.username':              'Username',
    'register.username.placeholder':  'Choose your username',
    'register.email':                 'Email Address',
    'register.email.placeholder':     'your@email.com',
    'register.password':              'Password',
    'register.password.placeholder':  'Minimum 8 characters',
    'register.confirm':               'Confirm Password',
    'register.confirm.placeholder':   'Confirm your password',
    'register.gender':                'Choose gender',
    'register.gender.male':           'Male',
    'register.gender.female':         'Female',
    'register.gender.other':          'Other',
    'register.submit':                'Create Account',
    'register.success':               '✓ Welcome to Heartlux! Your account has been created.',
    'register.login':                 'Already a member?',
    'register.login.link':            'Log in',
    'register.alert.password.length': 'Password must be at least 8 characters',
    'register.alert.password.match':  'Passwords do not match',

    'discover.title':               '🎀 What are you looking for?',
    'discover.subtitle':            'Tell us a bit about yourself to find your perfect match.',
    'discover.interest.heading':    "I'm interested in meeting",
    'discover.interest.male':       'Men',
    'discover.interest.male.desc':  'Connect with male users',
    'discover.interest.female':     'Women',
    'discover.interest.female.desc':'Connect with female users',
    'discover.interest.everyone':   'Open to everyone',
    'discover.interest.everyone.desc': 'Connect with anyone',
    'discover.age.heading':         'Age Range',
    'discover.age.unit':            'years',
    'discover.interests.heading':   'My Interests',
    'discover.back':                '← Back',
    'discover.finish':              'Complete Profile',
    'discover.alert.interest':      'Please choose who you want to meet',
    'discover.alert.interests':     'Please choose at least one interest',

    'interest.travel':  '✈️ Travel',
    'interest.music':   '🎵 Music',
    'interest.fitness': '💪 Fitness',
    'interest.cooking': '🍳 Food',
    'interest.books':   '📚 Books',
    'interest.art':     '🎨 Art',

    'matches.stat.likes':    'Likes Given',
    'matches.stat.matches':  'Matches',
    'matches.stat.shown':    'Shown',
    'matches.undo':          '↩ Undo',
    'matches.pass':          'Pass',
    'matches.like':          '❤️ Like',
    'matches.empty.title':   "You've seen all profiles!",
    'matches.empty.text':    'Come back later for more connections.',
    'matches.empty.back':    'Back to Home',
    'matches.noprofile.title': 'Set up your profile',
    'matches.noprofile.text':  'Enter your preferences to start browsing profiles.',
    'matches.noprofile.btn':   'Set Preferences',
    'matches.footer.home':   '← Home',
    'matches.popup.title':   "It's a match!",
    'matches.popup.matched': 'You and {name} matched!',
    'matches.popup.btn':     'Keep Browsing ❤️',

    'setup.done.title': 'Profile complete!',
    'setup.done.text':  'Time to explore matches...',

    'footer.privacy': 'Privacy',
    'footer.terms':   'Terms of Service',

    'auth.tab.register': 'Create account',
    'auth.tab.login':    'Log in',
    'auth.gate':         '🔒 You need an account to continue. Register or log in below.',

    'login.title':                  '❤️ Log in to Heartlux',
    'login.subtitle':               'Welcome back!',
    'login.identifier':             'Email or username',
    'login.identifier.placeholder': 'your@email.com',
    'login.password':               'Password',
    'login.password.placeholder':   'Your password',
    'login.submit':                 'Log in',
    'login.register':               'Not registered?',
    'login.register.link':          'Create account',
    'login.success':                '✓ Welcome back, {name}!',
    'login.alert.notfound':         'No account found. Please register first.',
    'login.alert.invalid':          'Incorrect email/username or password.',
  }
};

function t(key, vars = {}) {
  const lang = localStorage.getItem('heartlux_lang') || 'sv';
  const str = (translations[lang] && translations[lang][key])
    || translations.sv[key]
    || key;
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  const toggle = document.getElementById('langToggle');
  const lang = localStorage.getItem('heartlux_lang') || 'sv';
  if (toggle) toggle.textContent = lang === 'sv' ? 'EN' : 'SV';
  document.documentElement.lang = lang;
  updateNavbar();
}

function toggleLanguage() {
  const current = localStorage.getItem('heartlux_lang') || 'sv';
  localStorage.setItem('heartlux_lang', current === 'sv' ? 'en' : 'sv');
  applyTranslations();
}

// ─── Navigation ───────────────────────────────────────────────────────────

function showPage(pageId) {
  const user = JSON.parse(localStorage.getItem('heartlux_user'));

  if ((pageId === 'discover' || pageId === 'matches') && !user) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('register').classList.add('active');
    window.scrollTo(0, 0);
    switchAuthTab('register');
    const gate = document.getElementById('authGate');
    if (gate) { gate.textContent = t('auth.gate'); gate.style.display = 'block'; }
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
  if (pageId === 'matches') initMatches();
}

function switchAuthTab(tab) {
  const isReg = tab === 'register';
  document.getElementById('sectionRegister').style.display = isReg ? '' : 'none';
  document.getElementById('sectionLogin').style.display    = isReg ? 'none' : '';
  document.getElementById('tabRegister').classList.toggle('active',  isReg);
  document.getElementById('tabLogin').classList.toggle('active', !isReg);
  const gate = document.getElementById('authGate');
  if (gate && isReg === false) gate.style.display = 'none';
}

// ─── Age slider ───────────────────────────────────────────────────────────

const ageRange = document.getElementById('ageRange');
const ageDisplay = document.getElementById('ageDisplay');
if (ageRange) {
  ageRange.addEventListener('input', e => {
    ageDisplay.textContent = e.target.value;
  });
}

// ─── Option cards ─────────────────────────────────────────────────────────

function selectOption(category, value, element) {
  element.parentElement.querySelectorAll('.option-card')
    .forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');
  localStorage.setItem(`heartlux_${category}`, value);
}

// ─── Registration ─────────────────────────────────────────────────────────

function handleRegister(event) {
  event.preventDefault();

  const username        = document.getElementById('username').value;
  const email           = document.getElementById('email').value;
  const password        = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const gender          = document.querySelector('input[name="gender"]:checked').value;

  if (password.length < 8) { alert(t('register.alert.password.length')); return; }
  if (password !== confirmPassword) { alert(t('register.alert.password.match')); return; }

  localStorage.setItem('heartlux_user', JSON.stringify({
    username, email, password, gender,
    createdAt: new Date().toISOString()
  }));

  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('successMessage').textContent = t('register.success');
  document.getElementById('successMessage').classList.add('show');

  setTimeout(() => {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('registerForm').reset();
    updateNavbar();
    showPage('discover');
  }, 2000);
}

// ─── Login ────────────────────────────────────────────────────────────────

function handleLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const password   = document.getElementById('loginPassword').value;
  const stored     = JSON.parse(localStorage.getItem('heartlux_user'));

  if (!stored) { alert(t('login.alert.notfound')); return; }

  const valid = (identifier === stored.email.toLowerCase() || identifier === stored.username.toLowerCase())
             && password === stored.password;

  if (!valid) { alert(t('login.alert.invalid')); return; }

  const successEl = document.getElementById('loginSuccess');
  successEl.textContent = t('login.success', { name: stored.username });
  successEl.classList.add('show');

  setTimeout(() => {
    successEl.classList.remove('show');
    document.getElementById('loginForm').reset();
    updateNavbar();
    showPage(localStorage.getItem('heartlux_preferences') ? 'matches' : 'discover');
  }, 1500);
}

// ─── Discover / Setup ─────────────────────────────────────────────────────

function finishSetup() {
  const interest  = localStorage.getItem('heartlux_interest');
  const age       = document.getElementById('ageRange').value;
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
    .map(cb => cb.value);

  if (!interest)          { alert(t('discover.alert.interest'));  return; }
  if (!interests.length)  { alert(t('discover.alert.interests')); return; }

  localStorage.setItem('heartlux_preferences', JSON.stringify({
    interest, age, interests, completedAt: new Date().toISOString()
  }));

  matchState = { currentProfileIndex: 0, profiles: [], likes: [], passes: [], shown: [], history: [], matches: 0 };

  document.querySelector('.selector-section').innerHTML = `
    <div style="text-align: center; padding: 3rem 2rem;">
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">💗</div>
      <h2 style="color: var(--heart-primary);">${t('setup.done.title')}</h2>
      <p style="margin: 1rem 0; color: #666;">${t('setup.done.text')}</p>
    </div>
  `;

  setTimeout(() => showPage('matches'), 1500);
}

// ─── Navbar / Auth ────────────────────────────────────────────────────────

function updateNavbar() {
  const user     = JSON.parse(localStorage.getItem('heartlux_user'));
  const joinLink = document.querySelector('.navbar-link[data-page="register"]');
  if (!joinLink) return;

  if (user) {
    joinLink.textContent = `${t('nav.hello')}, ${user.username}`;
    joinLink.onclick = null;

    let logoutLink = document.getElementById('logoutLink');
    if (!logoutLink) {
      logoutLink = document.createElement('a');
      logoutLink.id        = 'logoutLink';
      logoutLink.href      = '#';
      logoutLink.className = 'navbar-link navbar-logout';
      logoutLink.onclick   = logout;
      joinLink.parentElement.appendChild(logoutLink);
    }
    logoutLink.textContent = t('nav.logout');
  } else {
    joinLink.textContent = t('nav.join');
    joinLink.onclick = () => showPage('register');
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) logoutLink.remove();
  }
}

function logout() {
  ['heartlux_user', 'heartlux_preferences', 'heartlux_likes',
   'heartlux_passes', 'heartlux_interest'].forEach(k => localStorage.removeItem(k));
  matchState = { currentProfileIndex: 0, profiles: [], likes: [], passes: [], shown: [], history: [], matches: 0 };
  updateNavbar();
  showPage('home');
}

// ─── Init ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const storedInterest = localStorage.getItem('heartlux_interest');
  if (storedInterest) {
    document.querySelectorAll('.option-card[data-value]').forEach(card => {
      if (card.dataset.value === storedInterest) card.classList.add('selected');
    });
  }
  applyTranslations();
  initMatches();
});

// ─── Matches system ───────────────────────────────────────────────────────

const biosSv = [
  'Älskar att utforska nya städer och kulturer',
  'Fitnessentusiast och naturälskare',
  'Musiker och bokälskare',
  'Resenär med en passion för äventyr',
  'Lagar gärna middagar för vänner',
  'Yoga och meditation är min passion',
  'Chef till yrket och matälskare',
  'Konstälskare och fotograf',
  'Äventyrlystnad och spontan',
  'Njuter av långa promenader i naturen',
];

const biosEn = [
  'Loves exploring new cities and cultures',
  'Fitness enthusiast and nature lover',
  'Musician and book lover',
  'Traveler with a passion for adventure',
  'Enjoys cooking dinners for friends',
  'Yoga and meditation are my passion',
  'Chef by profession and food lover',
  'Art lover and photographer',
  'Adventurous and spontaneous',
  'Loves long walks in nature',
];

const firstNames = ['Emma','Anna','Sofia','Lisa','Maria','Eva','Karin','Petra','Johan','Anders','Lars','Erik','Michael','David','Nils','Per','Magnus','Thomas','Stefan','Daniel'];
const lastNames  = ['Andersson','Bergström','Carlsson','Dahlström','Eriksson','Fredriksson','Gustafsson','Hansson','Isaksson','Johansson','Larsson','Mattsson','Nilsson','Olsson','Pettersson','Svensson','Thåström'];
const cities     = ['Stockholm','Göteborg','Malmö','Uppsala','Västerås','Örebro','Linköping','Helsingborg','Jönköping','Norrköping'];
const allInterests = ['travel','music','fitness','cooking','books','art'];

let matchState = {
  currentProfileIndex: 0,
  profiles: [],
  likes: [],
  passes: [],
  shown: [],
  history: [],
  matches: 0
};

function generateProfiles() {
  const lang    = localStorage.getItem('heartlux_lang') || 'sv';
  const bioList = lang === 'en' ? biosEn : biosSv;
  const profiles = [];

  for (let i = 0; i < 20; i++) {
    const gender      = Math.random() > 0.5 ? 'male' : 'female';
    const numInterests = Math.floor(Math.random() * 4) + 2;
    const interests   = [];
    while (interests.length < numInterests) {
      const pick = allInterests[Math.floor(Math.random() * allInterests.length)];
      if (!interests.includes(pick)) interests.push(pick);
    }
    profiles.push({
      id:        i,
      name:      firstNames[Math.floor(Math.random() * firstNames.length)],
      age:       Math.floor(Math.random() * 48) + 18,
      gender,
      city:      cities[Math.floor(Math.random() * cities.length)],
      bio:       bioList[Math.floor(Math.random() * bioList.length)],
      interests,
      avatar:    gender === 'male' ? '👨' : '👩'
    });
  }
  return profiles;
}

function initMatches() {
  const preferences = localStorage.getItem('heartlux_preferences');
  const profileCard  = document.getElementById('profileCard');
  const actionButtons = document.getElementById('actionButtons');
  const noMore       = document.getElementById('noMoreProfiles');
  if (!profileCard) return;

  if (!preferences) {
    matchState = { currentProfileIndex: 0, profiles: [], likes: [], passes: [], shown: [], history: [], matches: 0 };
    updateStats();
    profileCard.style.display = 'none';
    if (actionButtons) actionButtons.style.display = 'none';
    if (noMore) {
      noMore.style.display = 'block';
      noMore.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎀</div>
          <h2>${t('matches.noprofile.title')}</h2>
          <p>${t('matches.noprofile.text')}</p>
          <button class="btn btn-primary btn-lg" onclick="showPage('discover')" style="margin-top: 1.5rem;">
            ${t('matches.noprofile.btn')}
          </button>
        </div>
      `;
    }
    return;
  }

  if (matchState.profiles.length === 0) {
    const prefs = JSON.parse(preferences);
    matchState.likes  = JSON.parse(localStorage.getItem('heartlux_likes'))  || [];
    matchState.passes = JSON.parse(localStorage.getItem('heartlux_passes')) || [];
    matchState.profiles = generateProfiles().filter(p => {
      return (parseInt(p.age) <= parseInt(prefs.age))
        && p.interests.some(i => prefs.interests.includes(i))
        && (prefs.interest === 'everyone' || p.gender === prefs.interest);
    });
  }

  updateStats();
  loadProfile();
  initSwipeGesture();
}

function loadProfile() {
  const profileCard   = document.getElementById('profileCard');
  const actionButtons = document.getElementById('actionButtons');
  const noMore        = document.getElementById('noMoreProfiles');

  if (matchState.currentProfileIndex >= matchState.profiles.length) {
    profileCard.style.display = 'none';
    if (actionButtons) actionButtons.style.display = 'none';
    if (noMore) noMore.style.display = 'block';
    return;
  }

  profileCard.style.display = 'block';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (noMore) noMore.style.display = 'none';

  const profile = matchState.profiles[matchState.currentProfileIndex];

  document.getElementById('cardName').textContent     = `${profile.name}, ${profile.age}`;
  document.getElementById('cardLocation').textContent = `📍 ${profile.city}`;
  document.getElementById('cardBio').textContent      = profile.bio;
  document.getElementById('cardAvatar').textContent   = profile.avatar;

  const interestsList = document.getElementById('interestsList');
  interestsList.innerHTML = '';
  profile.interests.forEach(interest => {
    const tag = document.createElement('div');
    tag.className   = 'interest-tag';
    tag.textContent = t(`interest.${interest}`);
    interestsList.appendChild(tag);
  });

  profileCard.classList.remove('card-appear');
  void profileCard.offsetWidth;
  profileCard.classList.add('card-appear');

  matchState.shown.push(profile.id);
  updateStats();
}

function likeProfile(fromSwipe = false) {
  if (matchState.currentProfileIndex >= matchState.profiles.length) return;
  const profile = matchState.profiles[matchState.currentProfileIndex];
  const card    = document.getElementById('profileCard');
  const isMatch = Math.random() < 0.35;

  matchState.history.push({ profileId: profile.id, action: 'like', index: matchState.currentProfileIndex });
  matchState.likes.push(profile.id);

  if (!fromSwipe) card.classList.add('card-swipe-right');

  setTimeout(() => {
    if (!fromSwipe) card.classList.remove('card-swipe-right');
    matchState.currentProfileIndex++;
    localStorage.setItem('heartlux_likes', JSON.stringify(matchState.likes));
    loadProfile();
    if (isMatch) {
      matchState.matches++;
      setTimeout(() => showMatchPopup(profile.name), 200);
    }
  }, fromSwipe ? 50 : 500);
}

function passProfile(fromSwipe = false) {
  if (matchState.currentProfileIndex >= matchState.profiles.length) return;
  const profile = matchState.profiles[matchState.currentProfileIndex];
  const card    = document.getElementById('profileCard');

  matchState.history.push({ profileId: profile.id, action: 'pass', index: matchState.currentProfileIndex });
  matchState.passes.push(profile.id);

  if (!fromSwipe) card.classList.add('card-swipe-left');

  setTimeout(() => {
    if (!fromSwipe) card.classList.remove('card-swipe-left');
    matchState.currentProfileIndex++;
    localStorage.setItem('heartlux_passes', JSON.stringify(matchState.passes));
    loadProfile();
  }, fromSwipe ? 50 : 500);
}

// ─── Swipe gesture ────────────────────────────────────────────────────────

let swipeInitialized = false;

function initSwipeGesture() {
  if (swipeInitialized) return;
  swipeInitialized = true;

  const card = document.getElementById('profileCard');
  if (!card) return;

  let startX = 0, currentX = 0, isDragging = false;

  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onStart(e) {
    if (matchState.currentProfileIndex >= matchState.profiles.length) return;
    isDragging = true;
    startX = getX(e);
    currentX = 0;
    card.style.transition = 'none';
  }

  function onMove(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    currentX = getX(e) - startX;
    const rotation = currentX * 0.07;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

    const like = document.getElementById('swipeLike');
    const pass = document.getElementById('swipePass');
    if (currentX > 20) {
      like.style.opacity = Math.min((currentX - 20) / 80, 1);
      pass.style.opacity = 0;
    } else if (currentX < -20) {
      pass.style.opacity = Math.min((-currentX - 20) / 80, 1);
      like.style.opacity = 0;
    } else {
      like.style.opacity = 0;
      pass.style.opacity = 0;
    }
  }

  function resetIndicators() {
    const like = document.getElementById('swipeLike');
    const pass = document.getElementById('swipePass');
    if (like) like.style.opacity = 0;
    if (pass) pass.style.opacity = 0;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    resetIndicators();

    if (currentX > 100) {
      card.style.transition = 'transform 0.38s ease, opacity 0.38s ease';
      card.style.transform  = 'translateX(700px) rotate(28deg)';
      card.style.opacity    = '0';
      setTimeout(() => {
        card.style.transition = '';
        card.style.transform  = '';
        card.style.opacity    = '';
        likeProfile(true);
      }, 370);
    } else if (currentX < -100) {
      card.style.transition = 'transform 0.38s ease, opacity 0.38s ease';
      card.style.transform  = 'translateX(-700px) rotate(-28deg)';
      card.style.opacity    = '0';
      setTimeout(() => {
        card.style.transition = '';
        card.style.transform  = '';
        card.style.opacity    = '';
        passProfile(true);
      }, 370);
    } else {
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

function undoProfile() {
  if (!matchState.history.length) return;
  const last = matchState.history.pop();
  matchState.currentProfileIndex = last.index;
  matchState.shown = matchState.shown.filter(id => id !== last.profileId);

  if (last.action === 'like') {
    matchState.likes = matchState.likes.filter(id => id !== last.profileId);
    localStorage.setItem('heartlux_likes', JSON.stringify(matchState.likes));
  } else {
    matchState.passes = matchState.passes.filter(id => id !== last.profileId);
    localStorage.setItem('heartlux_passes', JSON.stringify(matchState.passes));
  }

  const profileCard   = document.getElementById('profileCard');
  const actionButtons = document.getElementById('actionButtons');
  const noMore        = document.getElementById('noMoreProfiles');
  if (profileCard)   profileCard.style.display   = 'block';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (noMore)        noMore.style.display         = 'none';

  loadProfile();
}

function showMatchPopup(name) {
  const popup = document.getElementById('matchPopup');
  if (!popup) return;
  document.getElementById('matchPopupName').textContent = t('matches.popup.matched', { name });
  popup.querySelector('[data-i18n="matches.popup.title"]').textContent = t('matches.popup.title');
  popup.querySelector('[data-i18n="matches.popup.btn"]').textContent   = t('matches.popup.btn');
  popup.style.display = 'flex';
  updateStats();
}

function closeMatchPopup() {
  const popup = document.getElementById('matchPopup');
  if (popup) popup.style.display = 'none';
}

function updateStats() {
  const l = document.getElementById('likesCount');
  const m = document.getElementById('matchesCount');
  const s = document.getElementById('shownCount');
  if (l) l.textContent = matchState.likes.length;
  if (m) m.textContent = matchState.matches;
  if (s) s.textContent = matchState.shown.length;
}
