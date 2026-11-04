# Project maintenance

## Source, outputs and local material

| Location | Purpose | Cleanup rule |
|---|---|---|
| `src/`, `content/` | Application and authored content | Keep; validate changes |
| `assets-source/photography/` | Versioned image-generation inputs | Keep; required by asset checks |
| `public/assets/` | Images used by the website | Remove only after reference checks |
| `assets-src/` | Ignored local RAW/master photographs | Keep; never clean automatically |
| `workspace/` | Local curation, original imports and receipts | Inspect individually; keep provenance and backups |
| `.generated/writing.json` | Prepared writing data | Rebuilt by `predev`, `prebuild` and `pretypecheck` |
| `workspace/photography/bangkok/source-report.json` | Original-photo provenance | Keep; not a disposable cache |
| `.next/`, `.cache/` | Reproducible builds, reports and compiler caches | Safe targets for `npm run clean` |
| `.cache/playwright/{report,results,visual-audit}/` | Browser report, failures and review screenshots | Generated; never mix with source files |
| `.cache/typescript/tsconfig.tsbuildinfo` | Incremental TypeScript cache | Generated |
| `tests/unit/`, `tests/e2e/` | Unit and browser tests | Keep |
| `tests/e2e/*-snapshots/` | Checked-in visual regression baselines | Keep; these are test inputs |
| `node_modules/` | Installed development dependencies | Restore with `npm ci`; normal cleanup retains it |
| `.git/` | Recovery history | Keep; cleanup does not rewrite history |

Stop a running development/preview server before `npm run clean`. Restart development with `npm run dev`, or recreate a production preview with `npm run build && npm run start`.

Tool configuration lives in `config/`: Playwright, ESLint, Tailwind, and TypeScript. Use the existing npm commands so the correct config is selected automatically. Next.js explicitly loads `config/tsconfig.json`; `src/tsconfig.json` lets editors discover the same settings. VS Code reads the ESLint override in `.vscode/settings.json`. Restart the development server after editing the custom TypeScript configuration. PostCSS plugin settings live in `package.json`.

Only fixed project entry files remain at the root: `AGENTS.md`, `package.json`, `package-lock.json`, `next.config.js`, generated `next-env.d.ts`, and `vercel.json`. The project guide is [README.md](README.md); Claude instructions live in `.claude/CLAUDE.md`. CI uploads `.cache/playwright/` diagnostics with hidden-file inclusion enabled.

Maintenance scripts are grouped by purpose: `scripts/writing/`, `scripts/images/`, `scripts/photography/`, `scripts/checks/`, `scripts/hobby/`, `scripts/maintenance/`, `scripts/dev/` and `scripts/migrations/`. Run npm commands from the repository root; their public command names have not changed. The Windows launcher is `scripts/dev/start.bat` and changes to the repository root itself.

Local cleanup and website download size are separate measurements. Deleting `.next/` frees local cache space; removing unused `public/` files reduces deployment storage. Responsive image selection reduces visitor downloads. A file removed from the working tree remains in Git history until history is deliberately rewritten; this maintenance workflow does not do that.

## Retired archive

The 148 unchanged files formerly under `workspace/archive/` are retained in Git at `705987d9be03ac869cf08b768ac0b725eed8fc3f`. Their working copies can be restored using [archive recovery](maintenance/archive-recovery.md); the [cleanup receipt](maintenance/cleanup-2026-10-23.json) records the source revision and removed files. Private writing receipts and current source photographs are not part of that removal.

## Deployment inputs

`public/` is the browser-accessible asset directory. Source photographs live outside it. `.vercelignore` excludes local curation, previews and caches from CLI uploads, but keeps files required by `npm run build:deploy`, including image inputs, lint targets and validation scripts.

After structural changes run:

```bash
npm run verify
npm run test:e2e:production
```

Also run the development browser tests affected by the change. Preserve current URLs and content hashes when moving files.

## Historical tools

`scripts/migrations/` groups recovery/import utilities that are not used by development, build or ordinary publication commands:

- `migrate-writing-markdown.mjs`: the completed JSON-to-Markdown migration; reports no work when JSON sources are absent.
- `import-writing-selection.mjs`: imports the fixed historical handoff selection. Its `--write` mode replaces the current selection and can overwrite later edits.
- `import-bangkok-exhibition.mjs`: recreates the original reviewed Bangkok set from its external source directory; it writes images, exhibition data and provenance.

Keep these tools for reproducibility. Use the normal writing and photography commands for daily maintenance. The import scripts' root is the repository working directory, even though their files live inside `scripts/migrations/`.
