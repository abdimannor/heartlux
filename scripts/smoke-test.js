const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function listJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJs(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}
const jsFiles = listJs(path.join(root, 'js'));
const js = jsFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const appJs = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const i18nJs = fs.readFileSync(path.join(root, 'js', 'i18n.js'), 'utf8');

const failures = [];

function unique(values) {
  return [...new Set(values)].sort();
}

function fail(message) {
  failures.push(message);
}

// No inline handlers or inline styles: behaviour lives in modules, styling in CSS.
for (const match of html.matchAll(/<[^>]*\son(?:click|submit|keydown|change|input)="/g)) {
  fail(`Inline event handler left in index.html: ${match[0].slice(0, 60)}`);
}
for (const match of html.matchAll(/<[^>]*\sstyle="/g)) {
  fail(`Inline style attribute left in index.html: ${match[0].slice(0, 60)}`);
}
for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (/\sstyle="/.test(source)) fail(`Inline style in template string: ${path.relative(root, file)}`);
  if (/\son(?:click|change|input|keydown)="/.test(source)) fail(`Inline handler in template string: ${path.relative(root, file)}`);
  if (/\.innerHTML\s*=/.test(source)) fail(`innerHTML assignment (use textContent / h()): ${path.relative(root, file)}`);
}

// Every data-action / data-submit used in the HTML or the modules must be registered in app.js.
const actionNames = unique([...html.matchAll(/data-action="([^"]+)"/g), ...js.matchAll(/dataset: \{ action: '([^']+)'/g)].map(m => m[1]));
const actionsBlock = appJs.slice(appJs.indexOf('const actions = {'), appJs.indexOf('const submitActions'));
const handlerCalls = actionNames;
for (const name of actionNames) {
  if (!new RegExp(`^\\s*${name}:`, 'm').test(actionsBlock)) fail(`data-action without a handler in app.js: ${name}`);
}
const submitBlock = appJs.slice(appJs.indexOf('const submitActions'));
for (const [, name] of html.matchAll(/data-submit="([^"]+)"/g)) {
  if (!new RegExp(`^\\s*${name}:`, 'm').test(submitBlock)) fail(`data-submit without a handler in app.js: ${name}`);
}

if (!html.includes('<script type="module" src="js/app.js"></script>')) fail('index.html must load js/app.js as a module');

const htmlI18nKeys = unique([
  ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]),
  ...[...html.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(match => match[1]),
]);

function extractLanguageBlock(language) {
  const start = i18nJs.indexOf(`  ${language}: {`);
  if (start === -1) return '';

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = start; i < i18nJs.length; i++) {
    const char = i18nJs[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return i18nJs.slice(start, i + 1);
    }
  }

  return '';
}

function extractTranslationKeys(language) {
  const block = extractLanguageBlock(language);
  return new Set([...block.matchAll(/'([^']+)'\s*:/g)].map(match => match[1]));
}

for (const language of ['sv', 'en']) {
  const keys = extractTranslationKeys(language);
  if (!keys.size) {
    fail(`Could not find translations for language: ${language}`);
    continue;
  }

  for (const key of htmlI18nKeys) {
    if (!keys.has(key)) {
      fail(`Missing ${language} translation for HTML key: ${key}`);
    }
  }
}

const referencedIds = unique([...js.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1]));
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));

const manifestPath = path.join(root, 'manifest.webmanifest');
const serviceWorkerPath = path.join(root, 'sw.js');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!html.includes('rel="manifest"') || !html.includes('manifest.webmanifest')) {
  fail('index.html must link manifest.webmanifest');
}

if (!js.includes('navigator.serviceWorker.register')) {
  fail('js/pwa.js must register the service worker');
}

for (const required of ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons']) {
  if (!manifest[required]) fail(`manifest.webmanifest missing required field: ${required}`);
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  fail('manifest.webmanifest must define regular and maskable icons');
}

for (const icon of manifest.icons || []) {
  if (!fs.existsSync(path.join(root, icon.src))) {
    fail(`Manifest icon does not exist: ${icon.src}`);
  }
}

const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
for (const asset of ['index.html', 'css/style.css', 'manifest.webmanifest', ...jsFiles.map(file => path.relative(root, file))]) {
  if (!serviceWorker.includes(asset)) fail(`Service worker cache list missing: ${asset}`);
}

const robotsPath = path.join(root, 'robots.txt');
const sitemapPath = path.join(root, 'sitemap.xml');
const robots = fs.readFileSync(robotsPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');

for (const requiredMeta of ['rel="canonical"', 'og:title', 'og:description', 'twitter:card', 'application/ld+json']) {
  if (!html.includes(requiredMeta)) fail(`index.html missing SEO metadata: ${requiredMeta}`);
}

if (!robots.includes('Sitemap: https://abdimannor.github.io/heartlux/sitemap.xml')) {
  fail('robots.txt must reference the production sitemap URL');
}

if (!sitemap.includes('<loc>https://abdimannor.github.io/heartlux/</loc>')) {
  fail('sitemap.xml must include the production GitHub Pages URL');
}
const dynamicIds = new Set(['logoutLink', 'profileNavLink']);

for (const id of referencedIds) {
  if (!htmlIds.has(id) && !dynamicIds.has(id)) {
    fail(`JavaScript references missing HTML id: ${id}`);
  }
}

if (failures.length) {
  console.error('Smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Smoke test passed: ${handlerCalls.length} actions, ${jsFiles.length} modules, ${htmlI18nKeys.length} i18n keys, ${referencedIds.length} DOM ids checked.`);
