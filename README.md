# Heartlux

Live: https://abdimannor.github.io/heartlux/

Heartlux is a front-end concept of a dating and social discovery app. It runs
entirely in the browser: there is no backend, and everything you enter is kept
in your browser's `localStorage`. The interface is in Swedish by default, with
an English toggle.

It is a design and interaction study, not a service. Nobody else sees your
profile, the people you browse are generated at random, and their chat replies
are canned.

## Try it

The quickest way in is the **Testa demo / Try demo** button on the start page.
It creates a local demo account with preferences already filled in, adds three
example matches and takes you straight to discovery. If an account already
exists in the browser, it asks before replacing it.

You can also register a local account and go through the setup steps yourself.

## What is implemented

Everything below is in `index.html` and the ES modules under `js/`:

- **Register and log in.** A local account (username, email, password,
  gender) is saved in `localStorage`. Login compares the input with that one
  stored record. Discovery, matches and profile redirect to registration when
  no account exists.
- **Setup.** Choose who you want to see (women, men or everyone), an age range
  and a set of interests (travel, music, fitness, cooking, books, art).
- **Discovery.** Twenty profiles are generated with random names, ages, Swedish
  cities, bios, interests and a short prompt answer, filtered by your
  preferences and sorted by how many interests you share. You can like, pass,
  undo, or swipe the card with mouse or touch. A filter sheet narrows the deck
  live (and is remembered); when nothing is left, an empty state offers a reset.
- **Matches.** A like turns into a match about a third of the time (random).
  Matches are listed in their own tab with a "new" marker, and the nav link
  shows an unread count.
- **Chat.** Each match has a chat window. Messages are stored per match and
  survive a reload. The chat suggests three conversation starters built from
  shared interests, the match's prompt answer and city. A typing indicator,
  tied to that one conversation, comes before a random canned reply. The
  matches list can be searched by name or message text and shows the last
  message and an unread dot per chat.
- **Profile editor.** Upload your own photo (cropped to the card and kept in
  IndexedDB, never uploaded), or pick an emoji avatar; write a bio and answer
  card prompts while a live preview shows your card. Simple counts of likes
  and matches sit beside it. Logout removes all Heartlux user data from
  `localStorage`.
- **Language and theme.** Swedish and English strings live in one
  `translations` object; the language choice and a dark mode toggle are both
  remembered.
- **Installable app shell.** A web manifest (with Discover and Matches
  shortcuts) and a service worker that caches the app files, so the site
  loads offline after the first visit.

## How it is built

No framework and no build step. The site is plain files served as they are:

| File | Purpose |
| --- | --- |
| `index.html` | All pages as sections; only one is shown at a time |
| `css/style.css` | Layout, components, dark mode |
| `js/app.js` | Entry module: one delegated click/submit listener mapping `data-action` names to handlers, then start-up |
| `js/state.js` | `localStorage` keys and access helpers, the in-memory session (deck, chat partner) |
| `js/i18n.js` | Swedish and English strings, `t()`, `translateDocument()` |
| `js/profiles.js` | Pure functions: profile generation, matching, compatibility score, canned replies |
| `js/dom.js` | `h()` element builder (text via `textContent`), `setVisible()`, `escapeHtml()` |
| `js/pwa.js` | Service worker registration |
| `js/ui/navigation.js` | `showPage()`, navbar account links, unread badge, logout |
| `js/ui/language.js`, `js/ui/theme.js` | Language toggle, dark mode |
| `js/ui/register.js`, `js/ui/discover.js` | Register/login forms, auth tabs, age sliders, preference setup |
| `js/ui/matches.js`, `js/ui/swipe.js`, `js/ui/matches-list.js` | Card deck (like/pass/undo, popup, stats), swipe gesture, "my matches" list |
| `js/ui/chat.js`, `js/ui/profile.js`, `js/ui/demo.js` | Chat modal, own profile page, demo account |
| `sw.js` | Service worker: cache-first for the app shell, `index.html` as offline fallback |
| `manifest.webmanifest` | PWA metadata and icons (`images/`) |
| `404.html`, `robots.txt`, `sitemap.xml` | GitHub Pages extras |
| `server.js` | Small Node static server for local use, port 8080 |

Some choices worth knowing about:

- **Single page, no router.** `showPage(id)` toggles an `active` class on a
  section. Buttons and links carry `data-action` (and `data-arg`); forms carry
  `data-submit`. `js/app.js` handles them with one delegated listener, so
  there are no inline handlers and no globals on `window`.
- **No inline styles.** Visibility is the `.is-hidden` class; the classes that
  replaced `style=""` attributes sit at the end of `css/style.css`.
- **Safe DOM.** Usernames, bios and chat messages are only ever set with
  `textContent` (through `h()`); no module assigns `innerHTML`.
- **Translations by attribute.** Elements carry `data-i18n` or
  `data-i18n-placeholder`; `applyTranslations()` fills them from the current
  language. Text built in JavaScript uses `t(key)`. Because the attribute
  replaces the element's text, anything that must survive (such as the unread
  badge) sits next to the translated span, not inside it.
- **State in `localStorage`.** Keys are prefixed `heartlux_` (user,
  preferences, likes, passes, matches, chats, avatar, bio, language, theme).

## Run it locally

Requires Node.js (CI uses version 22).

```sh
npm ci
npm start          # http://localhost:8080
```

The scripts are ES modules, which browsers do not load from `file://`, so
use the server rather than opening `index.html` directly.

## Tests

```sh
npm run check                      # syntax checks + scripts/smoke-test.js
npx playwright install chromium    # once
npm run check:e2e                  # starts server.js and runs Playwright
```

`scripts/smoke-test.js` checks that every `data-action`/`data-submit` has a
handler in `js/app.js`, that the HTML and modules contain no inline handlers,
inline styles or `innerHTML` assignments, that every translation key used in
the HTML exists in both languages, that every id looked up with `byId` or
`getElementById` exists in the HTML, and that the service worker precaches
every module.

The Playwright specs in `tests/` drive a real browser through registration,
setup, discovery and the filter sheet, language and theme switching, the
profile editor and photo storage, chat (starters, persistence, search, unread
dot, typing indicator), the motion switch, timers and offline use, plus the
demo button. The same two commands run in GitHub Actions on pushes and pull
requests to `master`.

## Limits

- There are no real accounts. Only one account exists per browser, and
  clearing site data deletes it.
- The password is stored in plain text in `localStorage`. That is fine for a
  concept and not acceptable anywhere real. Do not reuse a real password here.
- Profiles, matches and replies are random. There is no matching logic beyond
  counting shared interests.
- No server means no messaging between people, no moderation and no privacy
  controls. Your own photo stays in this browser only.
- Accessibility has had an automated check only: Lighthouse accessibility
  scores 100 and axe-core reports no violations on the landing page and the
  demo matches view, in light and dark mode. No screen reader or keyboard-only
  testing has been done, and browser support beyond Chromium has not been
  tested.

## License

MIT. See [LICENSE](LICENSE).
