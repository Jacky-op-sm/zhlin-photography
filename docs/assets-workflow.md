# Asset Workflow (Deploy Efficiency)

## Directory Convention
- `assets-src/`: local raw photos (ignored by git, never deployed)
- `public/assets/`: web-ready deployment assets only

## Commands
- `npm run assets:optimize`: resize/compress deployment images in place
- `npm run check:assets`: fail on unreferenced assets, `.DS_Store`, size budget overflow

## Default Budgets
- total `public/assets` size: `<= 80MB`
- per-file max: `<= 2MB`

You can override with env vars:
- `ASSET_TOTAL_MB`
- `ASSET_MAX_FILE_MB`
- `PHOTO_MAX_DIM`
- `PHOTO_JPEG_QUALITY`
