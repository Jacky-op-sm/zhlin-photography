import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.join(process.cwd(), 'content');

export function getContentPath(...segments: string[]) {
  return path.join(contentRoot, ...segments);
}

export function readContentJson(...segments: string[]): unknown {
  return JSON.parse(fs.readFileSync(getContentPath(...segments), 'utf8'));
}

export function readContentDirNames(...segments: string[]) {
  return fs
    .readdirSync(getContentPath(...segments), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function readContentJsonFiles(...segments: string[]): unknown[] {
  const dir = getContentPath(...segments);

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8')));
}
