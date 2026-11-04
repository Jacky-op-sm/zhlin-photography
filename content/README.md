# Content Library

This directory is the canonical local content source for the site.

- `writing/*.md`: authored writing, frontmatter and stable article slugs. See [the writing workflow](writing/README.md).
- `travel/<slug>/meta.json`: travel listing and page metadata.
- `travel/<slug>/cards.json`: spot, bookstore and food slider cards.
- `photography/series.json`: photography series metadata and related links.
- `photography/photos/<series>.json`: published photo records. `filename` and `thumbnail` are public image URLs; `source` is a repository-relative input under `assets-source/photography/`.
- `photography/exhibitions/bangkok.json`: the Bangkok exhibition sequence, dimensions and descriptions.
- `photography/image-manifest.json`: generated-image integrity record; never edit it by hand.
- `hobby/profile.json`, `hobby/featured.json`, `hobby/monthly/*.json`: retained hobby profile, selections and monthly summaries; public visibility is controlled separately.
- `site/*.json`: navigation, homepage, profile and contact content.

`workspace/photography/street-selection/catalog.json` is a staging catalog, not a runtime source. `npm run photos:preview:street` previews it; publishing uses the explicit command documented in [the asset workflow](../docs/assets-workflow.md).

Run `npm run check:content` after editing content. Run `npm run check:assets` after changing image references or publication files.

Historical migration inputs and retired long-form travel drafts are no longer needed in the working tree. Their unchanged Git revision and restoration commands are documented in [archive recovery](../docs/maintenance/archive-recovery.md); the [cleanup receipt](../docs/maintenance/cleanup-2026-10-23.json) records the removed files. Current writing, image-generation inputs and private import receipts remain separate from this retired archive.
