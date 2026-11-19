// Translations and the t() lookup. Pure apart from reading the stored language.
import { KEYS, getItem, setItem } from './state.js';

export const translations = {
  sv: {
    'nav.home':     'Hem',
    'nav.langLabel': 'EN, byt språk till engelska',
    'nav.discover': 'Utforska',
    'nav.matches':  'Matchningar',
    'nav.join':     'Gå med',
    'nav.hello':    'Hej',
    'nav.logout':   'Logga ut',

    'hero.tagline':      'Där meningsfulla kontakter skapas. Möt människor som verkligen förstår dig.',
    'hero.description':  'Hitta genuina kontakter baserat på gemensamma intressen och värderingar.',
    'hero.cta.discover': 'Börja Utforska',
    'hero.cta.register': 'Skapa Konto',
    'hero.cta.demo':     'Testa demo',
    'demo.confirm':      'Det finns redan ett konto i den här webbläsaren. Ersätta det med demokontot?',

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
    'footer.note':    'Demoapp: allt sparas lokalt i din webbläsare.',

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

    'nav.profile': 'Min Profil',

    'profile.title':          'Min Profil',
    'profile.bio.label':      'Om mig',
    'profile.bio.placeholder':'Berätta om dig själv...',
    'profile.save':           'Spara Profil',
    'profile.saved':          '✓ Profilen är sparad!',
    'profile.prefs.edit':     'Ändra Preferenser',
    'profile.prefs.heading':  'Mina Preferenser',
    'profile.avatar.heading': 'Välj Avatar',
    'profile.stats.heading':  'Statistik',
    'profile.member':         'Medlem sedan',

    'matches.tab.browse':         '🃏 Bläddra',
    'matches.tab.mymatches':      '💕 Matchningar',
    'matches.list.empty.title':   'Inga matchningar ännu',
    'matches.list.empty.text':    'Fortsätt bläddra för att hitta matchningar!',
    'matches.list.chat':          '💬 Chatta',

    'chat.placeholder': 'Skriv ett meddelande...',
    'chat.send':        'Skicka',
    'chat.greeting':    'Hej! 😊 Kul att vi matchade!',

    'discover.age.min':   'Min ålder',
    'discover.age.max':   'Max ålder',

    'matches.compat':     '💕 {n} gemensamma intressen',
    'matches.new.badge':  'NY',

    'swipe.like':         'GILLA ❤️',
    'swipe.pass':         'NOPE ✕',

    'profile.pref.interest':  'Intresserad av',
    'profile.pref.interests': 'Intressen',
  },
  en: {
    'nav.home':     'Home',
    'nav.langLabel': 'SV, switch language to Swedish',
    'nav.discover': 'Discover',
    'nav.matches':  'Matches',
    'nav.join':     'Join',
    'nav.hello':    'Hi',
    'nav.logout':   'Log out',

    'hero.tagline':      'Where meaningful connections flow. Meet people who truly get you.',
    'hero.description':  'Discover genuine connections based on shared interests and values.',
    'hero.cta.discover': 'Start Discovering',
    'hero.cta.register': 'Create Account',
    'hero.cta.demo':     'Try demo',
    'demo.confirm':      'There is already an account in this browser. Replace it with the demo account?',

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
    'footer.note':    'Demo app: everything is saved locally in your browser.',

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

    'nav.profile': 'My Profile',

    'profile.title':          'My Profile',
    'profile.bio.label':      'About me',
    'profile.bio.placeholder':'Tell us about yourself...',
    'profile.save':           'Save Profile',
    'profile.saved':          '✓ Profile saved!',
    'profile.prefs.edit':     'Edit Preferences',
    'profile.prefs.heading':  'My Preferences',
    'profile.avatar.heading': 'Choose Avatar',
    'profile.stats.heading':  'Statistics',
    'profile.member':         'Member since',

    'matches.tab.browse':         '🃏 Browse',
    'matches.tab.mymatches':      '💕 My Matches',
    'matches.list.empty.title':   'No matches yet',
    'matches.list.empty.text':    'Keep browsing to find matches!',
    'matches.list.chat':          '💬 Chat',

    'chat.placeholder': 'Type a message...',
    'chat.send':        'Send',
    'chat.greeting':    'Hey! 😊 Great that we matched!',

    'discover.age.min':   'Min age',
    'discover.age.max':   'Max age',

    'matches.compat':     '💕 {n} shared interests',
    'matches.new.badge':  'NEW',

    'swipe.like':         'LIKE ❤️',
    'swipe.pass':         'NOPE ✕',

    'profile.pref.interest':  'Interested in',
    'profile.pref.interests': 'Interests',
  }
};

export function getLang() {
  return getItem(KEYS.lang) || 'sv';
}

export function setLang(lang) {
  setItem(KEYS.lang, lang);
}

/** Look up a key in the given language, falling back to Swedish, then the key itself. */
export function translate(lang, key, vars = {}) {
  const str = (translations[lang] && translations[lang][key])
    || translations.sv[key]
    || key;
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
}

export function t(key, vars = {}) {
  return translate(getLang(), key, vars);
}

/** Fill every [data-i18n] and [data-i18n-placeholder] element under root. */
export function translateDocument(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
