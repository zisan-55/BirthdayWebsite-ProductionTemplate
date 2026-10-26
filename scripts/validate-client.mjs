import { build } from 'esbuild';
import { readFileSync, statSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function loadConfiguration() {
  const result = await build({ stdin: { contents: 'export { birthdayConfig } from "./src/config/birthdayConfig"; export { validateBirthdayConfig } from "./src/lib/validateConfig"; export { getCountdown } from "./src/lib/time"; export { distributePhotos } from "./src/lib/distributePhotos";', resolveDir: root }, bundle: true, write: false, format: 'esm', platform: 'node', define: { 'import.meta.env.BASE_URL': '"./"' } });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
export function validateClient(client, getCountdown) {
  const errors = [];
  const required = (value, label) => { if (typeof value !== 'string' || !value.trim() || /[<>]/.test(value)) errors.push(label + ' must be a nonempty string without placeholder brackets.'); };
  required(client?.siteId, 'siteId');
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(client?.siteId ?? '')) errors.push('siteId must be 3–80 lowercase letters, numbers or hyphens and unique per site.');
  const recipient = client?.recipient ?? {};
  required(recipient.name, 'recipient.name'); required(recipient.nickname, 'recipient.nickname'); required(client?.sender?.name, 'sender.name');
  if (!Number.isInteger(recipient.age) || recipient.age < 1 || recipient.age > 150) errors.push('recipient.age must be an integer from 1 to 150.');
  if (typeof recipient.birthdayDate !== 'string' || typeof recipient.birthdayTime !== 'string' || typeof recipient.timezone !== 'string' || !getCountdown(recipient.birthdayDate, recipient.birthdayTime, recipient.timezone).valid) errors.push('Birthday date, time or IANA timezone is invalid (including nonexistent local times).');
  const asset = (src, label, extensions) => {
    if (typeof src !== 'string' || !/^\/?(?!\/)[\w./ -]+$/.test(src) || src.includes('..') || !extensions.test(src)) { errors.push(label + ' must be a local public asset path with a supported extension.'); return; }
    try {
      const base = realpathSync(resolve(root, 'public'));
      const file = realpathSync(resolve(base, src.replace(/^\//, '')));
      const rel = relative(base, file);
      if (rel.startsWith('..') || isAbsolute(rel) || !statSync(file).isFile() || statSync(file).size === 0) throw new Error();
    } catch { errors.push(label + ': missing, empty or unsafe file: ' + src); }
  };
  if (!Array.isArray(client?.photos) || ![10,20,35].includes(client.photos.length)) errors.push('photos must contain exactly 10, 20 or 35 entries.');
  const seen = new Set();
  if (Array.isArray(client?.photos)) client.photos.forEach((photo, i) => {
    asset(photo?.src, `photos[${i}].src`, /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i);
    const key = photo?.src?.replace(/^\//, '');
    if (seen.has(key)) errors.push(`photos[${i}] duplicates another source; supply unique client photos.`); seen.add(key);
    for (const field of ['alt','caption']) if (photo?.[field] != null) required(photo[field], `photos[${i}].${field}`);
  });
  for (const section of ['messages','music']) if (!client?.[section] || typeof client[section] !== 'object' || Array.isArray(client[section])) errors.push(section + ' must be an object.');
  for (const key of Object.keys(client?.messages ?? {})) {
    if (!['reveal','introduction','closing','signature'].includes(key)) errors.push('Unknown messages field: ' + key);
    if (client.messages[key] != null) required(client.messages[key], 'messages.' + key);
  }
  if (client?.music?.src != null) { asset(client.music.src, 'music.src', /\.(mp3|wav|ogg|m4a|aac)$/i); required(client.music.title, 'music.title'); }
  else asset('/audio/birthday-song.mp3', 'default music', /\.mp3$/i);
  asset('/images/hero-dusk.svg', 'reveal background', /\.svg$/i);
  if (!Array.isArray(client?.scrapbookNotes) || client.scrapbookNotes.length !== 8) errors.push('scrapbookNotes must contain 8 entries (null for default or two custom notes per page).');
  else client.scrapbookNotes.forEach((notes,i) => { if (notes !== null) { if (!Array.isArray(notes) || notes.length !== 2) errors.push(`scrapbookNotes[${i}] requires two notes or null.`); else notes.forEach((note,j) => required(note, `scrapbookNotes[${i}][${j}]`)); } });
  return errors;
}
export async function check() {
  const client = JSON.parse(readFileSync(resolve(root, 'src/config/client.json'), 'utf8'));
  // Validate input before evaluating configuration that consumes it.
  const timeBundle = await build({entryPoints:[resolve(root,'src/lib/time.ts')],bundle:true,write:false,format:'esm',platform:'node'});
  const {getCountdown} = await import('data:text/javascript;base64,'+Buffer.from(timeBundle.outputFiles[0].text).toString('base64'));
  const errors = validateClient(client,getCountdown);
  if (errors.length) throw new Error('Client validation failed:\n- ' + errors.join('\n- '));
  const config = await loadConfiguration();
  const warnings = config.validateBirthdayConfig();
  if (warnings.length) throw new Error('Configuration validation failed:\n- ' + warnings.join('\n- '));
  console.log('Client validation passed: ' + client.siteId + ', ' + client.photos.length + ' photos.');
  return config;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) check().catch(error => { console.error(error.message); process.exitCode = 1; });
