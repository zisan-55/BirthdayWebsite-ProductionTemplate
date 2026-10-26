# Client personalization guide

## Scope and safety

Create a separate authorized customer repository using GitHub’s Use this template feature, then clone it. Confirm origin belongs to that customer repository before committing or pushing. Never modify the original repository or local master/development templates. The production template starts independent history without any copied remote.


## One source of client information

Edit `src/config/client.json`. `src/config/birthdayConfig.ts` retains the original scene settings, default copy, slot layouts, rotations, stickers and positions, then applies client data. Do not edit App.tsx or styles.css for routine personalization.

The production fixture uses generic recipient/sender labels and ten neutral SVG illustrations, with no customer photographs. `CLIENT_INFO.example.json` is the customer intake skeleton with placeholders and deliberately fails validation until completed. Never deploy the intake skeleton or the generic template fixture as a paid client site.

1. Make a separate client copy when authorized. Assign a unique `siteId`, 3–80 lowercase letters, digits or hyphens, starting with a letter or digit. Keep it stable across updates. The curtain key is `birthday-curtain-opened:<siteId>:<birthdayDate>`. All storage operations, including replay, use this namespace. Old unnamespaced markers are ignored. Uniqueness across sites must be enforced by the operator or future client registry; an isolated local build cannot check other sites.
2. Fill recipient name, nickname, turning age (integer 1–150), birthday date (`YYYY-MM-DD`), time (`HH:MM` or `HH:MM:SS`, 24-hour), and IANA timezone such as `Asia/Dhaka`. Impossible dates and nonexistent local DST times fail. For ambiguous DST times, the existing countdown resolver chooses an occurrence; confirm the intended instant with the client. No birth year is required.
3. Set `sender.name` independently. The closing note displays `messages.signature, sender.name`. Recipient nickname continues to be used for the cinema production label.
4. Keep each message (`reveal`, `introduction`, `closing`, `signature`) null for its existing default or supply a nonempty custom string. Null is a JSON value, not the string "null". Other headings and navigation remain in birthdayConfig.ts.
5. Put exactly 10, 20 or 35 distinct photos inside `public/images/client/`. List them in approved order with paths such as `/images/client/photo-01.jpg`. Paths are case-sensitive on GitHub Actions. JPG, JPEG, PNG, WebP, AVIF, GIF and SVG are supported. Supply optional `alt` and `caption` strings, or null for the existing slot text. A custom caption follows its photo when reused. Review default relationship-specific captions and notes with the client. Local nonempty files are required; remote URLs, traversal and files outside public are rejected. Files are not decoded by the validator: inspect the actual images as part of visual review.
6. `scrapbookNotes` contains eight entries in page order. Each is null for the existing notes, or exactly two nonempty strings. Pages retain their titles, layout, stickers and two photos each.
7. For default music leave `music.src` and `music.title` null. Custom music goes inside `public/audio/` and needs both a local `src` and display `title`. Supported extensions: MP3, WAV, OGG, M4A, AAC. Confirm browser playback; file existence alone does not establish codec compatibility. Audio artwork follows the first client photo. Reveal background remains the original `public/images/hero-dusk.svg`.

## Deterministic photo allocation

One 41-slot sequence cycles through the ordered client list, then fills: carousel 5, gallery 10, scrapbook 16 (8 pages × 2), Photo Universe 10. Each slot keeps its existing ID and layout metadata. Every supplied photo appears at least once for all supported packages. The list wraps when needed; distinct source validation and cyclic allocation avoid adjacent duplicates in the sequence, within each section, and at cyclic section boundaries with these package sizes. Spatial neighbors in the floating layouts may still share an image across different sections. No randomness or extra layout slots are introduced. The hero background is separate.

## Validation and preview

From the client copy run:

```sh
npm ci
npm run validate
npm test
npm run build:check
npm run dev
```

`npm run build` automatically runs `prebuild` validation before TypeScript and Vite. Invalid fields, duplicate photo sources, wrong counts, missing/empty media, invalid date/time/timezone, malformed notes, or missing sender stop the build with labeled errors. A failure must be corrected before delivery. Use the supported npm build command, not a direct `vite build` that bypasses npm lifecycle checks. Keep dependency lockfile versions consistent.

`build:check` validates and compiles production output into ignored `.build-check/`. For production, the existing `npm run build` writes `dist/`. Vite `base: "./"` remains unchanged. GitHub Actions runs npm ci, npm test and npm run build. The existing Pages artifact deployment steps are excluded for zisan-55/BirthdayWebsite-ProductionTemplate and require ENABLE_PAGES_DEPLOY=true in future client repositories. Configure each customer repository’s Pages source as GitHub Actions before deployment. No deployment was performed during template preparation.

Review all six scenes on desktop and mobile, countdown/preview/replay, sender signature, transitions, carousel, gallery lightbox, all scrapbook pages, Photo Universe, and music play/pause/seek/volume. Confirm local media and messages are approved. Automated checks do not replace this browser review.

## Generated output and private material

This production template starts a new Git history without the original tracked dist files. CI builds dist and uploads it as a Pages artifact. No original repository cleanup is necessary. Do not commit dependencies, generated builds, TypeScript metadata, credentials, private intake forms or test evidence. CLIENT_INFO.example.json contains placeholders only and may be committed as documentation.

.gitignore covers common secrets and generated/local artifacts. Inspect the exact publication manifest before committing. Never put secrets in client.json or public assets: they are publicly viewable when deployed.
