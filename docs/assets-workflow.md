# Asset workflow

## Source and generated boundaries

- `content/photography/photos/*.json` is the published source of truth for the Street, Animals and Projects exhibitions. `content/photography/exhibitions/bangkok.json` defines the separate Bangkok sequence.
- Versioned photography generation inputs live in `assets-source/photography/<series>/`, outside `public/`. A photo record's `source` is a repository-relative generation input, not a browser URL.
- Local RAW masters remain in ignored `assets-src/` or their original external directory. These workflows never overwrite masters.
- Photography `filename` and `thumbnail` records point to WebP derivatives in `public/assets/generated/photos/`. Their dimensions and hashes are recorded in `content/photography/image-manifest.json`.
- Bangkok's public WebP files live in `public/assets/photography/bangkok/`. Its private original-file report lives in ignored `workspace/photography/bangkok/source-report.json`.
- Only browser-used images belong in `public/assets/`. Source files required by validation remain available to the build, but are not served as public files.

All generation paths and budgets are defined in `scripts/images/config.mjs`. Catalog path fields are compatibility assertions and cannot override that configuration.

## Image policy

| Use | Publication format | Resolution / quality |
|---|---|---|
| Photography large image | WebP | Long edge at most 2400 px, quality 84 |
| Photography thumbnail | WebP | Long edge at most 640 px, quality 76 |
| Travel and home JPEG/PNG publication copies | WebP | Long edge at most 2400 px, quality 82, encoder effort 6 |
| Existing Photography and Writing WebP | Retain existing files | Avoid another lossy recompression |
| Icons and vector artwork | SVG where already used | Preserve vector detail |

Never enlarge a small image. Preserve aspect ratio and orientation; remove EXIF/GPS from public derivatives. Convert a travel/home image only when the resulting file is smaller. Keep source photographs or a recorded recovery copy so future exports do not repeatedly compress a previously compressed publication file.

These settings are starting points for this site, not a claim that one quality number suits every image. Inspect fine texture, gradients, text and dark areas before accepting an export. Keep a larger or higher-quality copy if the smaller one introduces visible damage. Layout, crop, captions and colors should stay consistent.

Next.js generates responsive delivery URLs and sizes from the actual displayed area. The Photography viewer uses its contained width and height to avoid oversized downloads. Once the selected image is decoded, it prepares up to five nearby photographs and retains at most six image elements, promoting the same decoded element on navigation. Save-Data disables this background preparation. This trades a bounded amount of idle transfer and browser memory for smoother forward/back navigation without changing image quality or the first-photo priority. Source preparation and responsive delivery solve different storage and download costs.

## Daily commands

```bash
# Preview suitable JPEG/PNG exports; existing WebPs are not recompressed.
npm run assets:optimize

# Replace only smaller exports and update their references. Originals must
# already be committed so they remain recoverable from the reported revision.
npm run assets:optimize:write

# Read-only report; validate the generated-path contract.
npm run assets:report

# Rebuild photography derivatives and their manifest.
npm run assets:write

# Verify sources, public files, hashes, dimensions and references.
npm run check:assets

# Preview the staged Street selection without changing the current site.
npm run photos:preview:street

# Explicitly publish the staged selection and generate its derivatives.
npm run photos:publish:street
```

`assets:clean` removes only reproducible generated photography files; run `assets:write` before serving or deploying again. `npm run clean` handles local build/test output and preserves source photographs, original-file reports and writing backups.

## Budgets and recovery

The 85 MiB total-public-assets and 1.8 MiB per-file budgets are defined in `scripts/images/config.mjs`. The repository checker accepts `ASSET_TOTAL_MB` and `ASSET_MAX_FILE_MB` overrides; photography generation uses the same configured per-file limit so generation and verification cannot drift.

Retired migration material removed from the working tree remains recoverable from its recorded Git revision. See [archive recovery](maintenance/archive-recovery.md) and the [cleanup receipt](maintenance/cleanup-2026-10-23.json). Do not treat untracked import receipts, original photographs or draft writing as disposable caches.

References: [web.dev image performance](https://web.dev/learn/performance/image-performance) explains modern formats and visual quality review; [Sharp output options](https://sharp.pixelplumbing.com/api-output/) defines the encoder and metadata behavior. The quality values above are this project's tested choices.
