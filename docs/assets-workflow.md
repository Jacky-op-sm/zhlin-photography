# Asset workflow

## Source and generated boundaries

- `content/photography/photos/*.json` is the published runtime source of truth.
- A photo record's `source` is a stable generation input. Current versioned inputs live under `public/assets/photos/`; local RAW masters belong in ignored `assets-src/` and are never modified by these scripts.
- `filename` and `thumbnail` must point to `public/assets/generated/photos/`. This directory and `content/photography/image-manifest.json` are reproducible outputs.
- Source photographs are never removed automatically. `assets:clean` removes only the generated photography directory, which can be rebuilt.

All paths, image profiles, and the per-file limit are defined once in `scripts/images/config.mjs`. Catalog path fields are compatibility assertions and cannot override that configuration.

## Commands

```bash
# Read-only report; validates that content already follows the generated-path contract.
npm run assets:report

# Rebuild generated WebP files and their manifest. Does not rewrite published content.
npm run assets:write

# Verify content, sources, generated files, hashes, dimensions, and manifest agreement.
npm run assets:check

# Preview the staging street selection; this does not alter the current site.
npm run photos:preview:street

# Explicitly publish the staged selection and generate all derivatives in one pipeline.
npm run photos:publish:street
```

## Budgets

- Total `public/assets`: at most `170 MB` by default.
- Each public asset and generated image: at most `1.8 MB` by default.

The repository-wide checker accepts `ASSET_TOTAL_MB` and `ASSET_MAX_FILE_MB` overrides. Photography derivatives always use the per-file limit from `scripts/images/config.mjs` so generation and verification cannot drift.
