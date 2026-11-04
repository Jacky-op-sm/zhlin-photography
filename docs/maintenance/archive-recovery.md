# Recovering retired project inputs

The 2026-10-23 cleanup removed the unused `workspace/archive/` working copies
(148 files, 42,337,425 bytes). These include unique historical prose and images,
not just duplicates. Their unchanged originals remain in Git commit
`705987d9be03ac869cf08b768ac0b725eed8fc3f`.

Recover them into a separate directory without changing the current site:

```bash
mkdir -p /tmp/zhlin-recovered
git archive 705987d9be03ac869cf08b768ac0b725eed8fc3f workspace/archive | tar -x -C /tmp/zhlin-recovered
```

The same revision retains the previous JPEG/PNG web exports and old gallery
components. Photography generation sources remain in the current project under
`assets-source/photography/`; unselected photographs and writing import receipts
remain in `workspace/`. No Git history was rewritten.

See [the cleanup receipt](cleanup-2026-10-23.json) for measured storage changes.
