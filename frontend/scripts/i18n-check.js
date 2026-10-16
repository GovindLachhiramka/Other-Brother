const fs = require('fs');
const path = require('path');

const REQUIRED_LANGS = [
  'en', 'hi', 'bn', 'ta', 'te', 'kn', 'mr', 'id', 'vi', 'th', 'fil', 'ms', 'ja', 'ko', 'zh-CN'
];

const i18nDir = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const enPath = path.join(i18nDir, 'en.json');

if (!fs.existsSync(enPath)) {
  console.error('Error: en.json not found at', enPath);
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getLeafPaths(obj, prefix = '') {
  let paths = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      paths = paths.concat(getLeafPaths(obj[k], full));
    } else {
      paths.push(full);
    }
  }
  return paths;
}

function getValue(obj, pathStr) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === undefined || curr === null || typeof curr !== 'object' || !(part in curr)) {
      return undefined;
    }
    curr = curr[part];
  }
  return curr;
}

const enKeys = getLeafPaths(en);
console.log(`Checking i18n across ${REQUIRED_LANGS.length} languages against ${enKeys.length} keys in en.json...\n`);

let hasError = false;

// Obsolete keys that should NOT exist
const OBSOLETE_KEYS = [
  'wait.tip_header',
  'wait.tip_desc',
  'wait.open_portal',
  'community.tabs_nearby',
  'peer.tabs_nearby',
  'peer.tabs_pool'
];

for (const lang of REQUIRED_LANGS) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] ${lang}.json: File does not exist!`);
    hasError = true;
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[FAIL] ${lang}.json: Invalid JSON syntax (${err.message})`);
    hasError = true;
    continue;
  }

  const missingKeys = [];
  for (const key of enKeys) {
    const val = getValue(data, key);
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missingKeys.push(key);
    }
  }

  const foundObsolete = [];
  for (const obs of OBSOLETE_KEYS) {
    if (getValue(data, obs) !== undefined) {
      foundObsolete.push(obs);
    }
  }

  if (missingKeys.length > 0) {
    console.error(`[FAIL] ${lang}.json: ${missingKeys.length} missing keys:`);
    missingKeys.slice(0, 10).forEach(k => console.error(`   - ${k}`));
    if (missingKeys.length > 10) {
      console.error(`   ... and ${missingKeys.length - 10} more`);
    }
    hasError = true;
  } else {
    console.log(`[PASS] ${lang}.json: All ${enKeys.length} keys present.`);
  }

  if (foundObsolete.length > 0) {
    console.warn(`[WARN] ${lang}.json has obsolete keys: ${foundObsolete.join(', ')}`);
  }
}

if (hasError) {
  console.error('\n❌ i18n check failed: Some languages have missing translation keys or missing files.');
  process.exit(1);
} else {
  console.log(`\n✅ All ${REQUIRED_LANGS.length} languages passed i18n check successfully!`);
  process.exit(0);
}
