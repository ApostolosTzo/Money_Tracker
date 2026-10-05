/**
 * Renders public/favicon.svg into the PNG sizes Android needs for the
 * installed app icon and the splash screen.
 *
 *   node scripts/generate-icons.mjs
 */
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(resolve(root, 'public/favicon.svg'));

await mkdir(resolve(root, 'public/icons'), { recursive: true });

/** The maskable icon needs its content inside the safe zone (80% centre). */
const maskableSvg = Buffer.from(
  svg
    .toString()
    .replace('<rect width="512" height="512" rx="112" fill="url(#bg)" />', '<rect width="512" height="512" fill="#6D28D9" />')
    .replace(/<svg /, '<svg ')
    .replace('viewBox="0 0 512 512"', 'viewBox="0 0 512 512"')
    .replace(
      '<!-- wallet body -->',
      '<g transform="translate(256 256) scale(0.78) translate(-256 -256)"><!-- wallet body -->',
    )
    .replace('</svg>', '</g></svg>'),
);

const jobs = [
  { file: 'public/icons/icon-192.png', size: 192, source: svg },
  { file: 'public/icons/icon-512.png', size: 512, source: svg },
  { file: 'public/icons/maskable-512.png', size: 512, source: maskableSvg },
  { file: 'public/apple-touch-icon.png', size: 180, source: svg },
];

for (const job of jobs) {
  await sharp(job.source, { density: 600 })
    .resize(job.size, job.size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(root, job.file));
  console.log('wrote', job.file);
}