# Content Library

This directory is the canonical local content source for the site.

- `travel/<slug>/meta.json`: travel listing and page metadata.
- `travel/<slug>/cards.json`: spot, bookstore, and food slider cards.
- `photography/series.json`: photography series copy and featured links.
- `photography/photos/<series>.json`: published photo records. `filename` and `thumbnail` are runtime images; `source` is only the repeatable generation input.
- `photography/image-manifest.json`: generated-image integrity record; never edit it by hand.
- `workspace/photography/street-selection/catalog.json`: a staging catalog, not a runtime source. `npm run photos:preview:street` previews its selection; publishing must use the explicit write command documented in `docs/assets-workflow.md`.
- `hobby/profile.json`: hobby intro, external profiles, and game profile.
- `hobby/featured.json`: featured reading, film, and game entries.
- `hobby/monthly/YYYY-MM.json`: monthly reading and film digest entries.

Run `npm run check:content` after editing content files.

Historical migration inputs and retired long-form travel drafts live under
`workspace/archive/`; they are intentionally outside the runtime and checks.
