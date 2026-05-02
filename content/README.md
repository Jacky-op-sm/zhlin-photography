# Content Library

This directory is the canonical local content source for the site.

- `travel/<slug>/meta.json`: travel listing and page metadata.
- `travel/<slug>/story.md`: long-form travel body, kept separate from structured fields.
- `travel/<slug>/cards.json`: spot, bookstore, and food slider cards.
- `photography/series.json`: photography series copy and featured links.
- `photography/photos/<series>.json`: photo records for each series.
- `hobby/profile.json`: hobby intro, external profiles, and game profile.
- `hobby/featured.json`: featured reading, film, and game entries.
- `hobby/monthly/YYYY-MM.json`: monthly reading and film digest entries.

Run `npm run check:content` after editing content files.
